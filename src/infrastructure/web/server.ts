import express from 'express';
import cors from 'cors';
import path from 'path';
import { ProjectScanner } from '../../domain/codeSource/ProjectScanner';
import { InMemoryCodeFileRepository } from '../../domain/codeSource/CodeFileRepository';
import { InMemoryStatisticsRepository } from '../../domain/statistics/StatisticsRepository';
import { ScanProjectCommand } from '../../application/commands/ScanProjectCommand';
import { FormatterFactory } from '../../domain/codeFormatter/FormatterFactory';
import { SyntaxHighlighter } from '../../domain/codeFormatter/SyntaxHighlighter';
import { TypingSession } from '../../domain/typing/TypingSession';
import { MetricsCalculator } from '../../domain/typing/MetricsCalculator';
import { SessionRecord } from '../../domain/statistics/SessionStatistics';
import { Language } from '../../domain/shared/Language';
import { SecurityConfig } from '../../domain/shared/SecurityConfig';
import { SecurityMiddleware } from '../security/SecurityMiddleware';
import { PathValidator } from '../../domain/shared/PathValidator';
import { InputValidator } from '../../domain/shared/InputValidator';

const app = express();
const port = process.env.PORT || 3000;

// Security configuration
const securityConfig = SecurityConfig.create({
  trustedOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    ...(process.env.TRUSTED_ORIGINS ? process.env.TRUSTED_ORIGINS.split(',') : [])
  ],
  maxRequestsPerMinute: parseInt(process.env.MAX_REQUESTS_PER_MINUTE || '60'),
  maxScanDepth: 5,
  maxFileSize: 1024 * 1024
});

const securityMiddleware = new SecurityMiddleware(securityConfig);

// Security Middleware - Applied first
app.use(securityMiddleware.getHelmetMiddleware());
app.use(securityMiddleware.commonSecurityMiddleware());
app.use(securityMiddleware.securityLogger());
app.use(securityMiddleware.requestSizeValidator());

// CORS with whitelist
app.use(cors(securityMiddleware.getCorsOptions()));

// Body parsing
app.use(express.json({ limit: '100kb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '../../../public')));

// Initialize repositories and services
const codeFileRepository = new InMemoryCodeFileRepository();
const statisticsRepository = new InMemoryStatisticsRepository();
const projectScanner = new ProjectScanner();
const syntaxHighlighter = new SyntaxHighlighter();
const metricsCalculator = new MetricsCalculator();

// Command handlers
const scanProjectCommand = new ScanProjectCommand(projectScanner, codeFileRepository);

// In-memory session storage (should be moved to proper storage in production)
const activeSessions = new Map<string, TypingSession>();
const sessionTimestamps = new Map<string, number>();

// Session cleanup configuration
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// Clean up abandoned sessions periodically
const sessionCleanupInterval = setInterval(() => {
  const now = Date.now();
  const sessionsToRemove: string[] = [];

  sessionTimestamps.forEach((timestamp, sessionId) => {
    if (now - timestamp > SESSION_TIMEOUT_MS) {
      sessionsToRemove.push(sessionId);
    }
  });

  sessionsToRemove.forEach(sessionId => {
    console.log(`[Cleanup] Removing abandoned session: ${sessionId}`);
    activeSessions.delete(sessionId);
    sessionTimestamps.delete(sessionId);
  });

  if (sessionsToRemove.length > 0) {
    console.log(`[Cleanup] Removed ${sessionsToRemove.length} abandoned sessions`);
  }
}, CLEANUP_INTERVAL_MS);

// Graceful shutdown
process.on('SIGTERM', () => {
  clearInterval(sessionCleanupInterval);
  console.log('Session cleanup interval cleared');
});

// Routes

// Apply general rate limiting to all API routes
app.use('/api/', securityMiddleware.getGeneralRateLimiter());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Get supported languages
app.get('/api/languages', (_req, res) => {
  const languages = Language.getAllSupported().map(lang => ({
    name: lang.name,
    extensions: lang.extensions
  }));
  res.json(languages);
});

// Scan project folder - with strict rate limiting
app.post('/api/scan', securityMiddleware.getStrictRateLimiter(), async (req, res) => {
  try {
    const { folderPath, options } = req.body;

    // Validate required field
    if (!folderPath) {
      res.status(400).json({ error: 'folderPath is required' });
      return;
    }

    // Validate folderPath is a string
    const validatedPath = InputValidator.validateNonEmptyString(folderPath, 'folderPath');

    // Validate path against path traversal attacks
    let securedPath: PathValidator;
    try {
      securedPath = PathValidator.create(validatedPath, securityConfig.getAllowedScanPaths());
    } catch (pathError) {
      console.warn(`[Security] Rejected scan request for path: ${validatedPath}`, pathError);
      res.status(403).json({
        error: 'Access denied',
        message: 'The specified path is not within allowed directories',
        allowedPaths: securityConfig.getAllowedScanPaths()
      });
      return;
    }

    // Apply security constraints to scan options
    const securedOptions = {
      ...options,
      maxDepth: options?.maxDepth
        ? Math.min(options.maxDepth, securityConfig.getMaxScanDepth())
        : securityConfig.getMaxScanDepth(),
      maxFileSize: options?.maxFileSize
        ? Math.min(options.maxFileSize, securityConfig.getMaxFileSize())
        : securityConfig.getMaxFileSize()
    };

    const result = await scanProjectCommand.execute({
      folderPath: securedPath.toString(),
      options: securedOptions
    });

    res.json({
      filesFound: result.files.length,
      totalSize: result.statistics.totalSize,
      byLanguage: Object.fromEntries(result.statistics.byLanguage),
      errors: result.errors
    });
  } catch (error) {
    console.error('Scan error:', error);

    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to scan folder' });
    }
  }
});

// Start typing session
app.post('/api/session/start', async (req, res) => {
  try {
    const { language, maxLines = 50 } = req.body;

    // Validate inputs
    const validatedLanguage = language ? InputValidator.validateLanguageName(language) : undefined;
    // const validatedUserId = InputValidator.validateUserId(userId); // Currently unused
    const validatedMaxLines = Math.min(200, Math.max(10, parseInt(maxLines) || 50));

    // Fix: Create the session properly without duplication
    const languageObj = validatedLanguage ? Language.fromName(validatedLanguage) : undefined;
    const randomFile = await codeFileRepository.getRandomFile(languageObj || undefined);
    if (!randomFile) {
      res.status(404).json({ error: 'No code files available for the selected language' });
      return;
    }

    // Create the typing session with the maxLines parameter
    const session = TypingSession.create(randomFile, validatedMaxLines);
    activeSessions.set(session.id, session);
    sessionTimestamps.set(session.id, Date.now()); // Track creation time for cleanup

    // Format and highlight the code snippet
    const formatter = FormatterFactory.createFormatter(randomFile.language);
    const formattedCode = formatter.format(session.codeSnippet);
    const tokens = syntaxHighlighter.highlight(formattedCode, randomFile.language);
    const highlightedHtml = syntaxHighlighter.toHTML(tokens);

    // Return properly structured response
    res.json({
      sessionId: session.id,
      codeSnippet: session.codeSnippet,
      formattedCode,
      highlightedHtml,
      language: randomFile.language.name,
      difficulty: randomFile.metadata.complexity
    });
  } catch (error) {
    console.error('Session start error:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

// Process typing input
app.post('/api/session/:sessionId/input', (req, res) => {
  try {
    const { sessionId } = req.params;
    const { character } = req.body;

    // Validate session ID format
    const validatedSessionId = InputValidator.validateSessionId(sessionId);

    // Validate character input - must be exactly one character
    const validatedCharacter = InputValidator.validateSingleCharacter(character);

    const session = activeSessions.get(validatedSessionId);

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Start session if not started
    if (session.state === 'idle' || session.state === 'ready') {
      session.start();
    }

    const input = session.processInput(validatedCharacter);
    const metrics = session.calculateMetrics();
    const progress = session.getProgress();

    res.json({
      input,
      metrics,
      progress,
      state: session.state,
      currentPosition: session.currentPosition,
      expectedCharacter: session.expectedCharacter
    });
  } catch (error) {
    console.error('Input processing error:', error);
    res.status(500).json({ error: 'Failed to process input' });
  }
});

// Handle backspace
app.post('/api/session/:sessionId/backspace', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Validate input
    const validatedSessionId = InputValidator.validateSessionId(sessionId);
    const session = activeSessions.get(validatedSessionId);

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Process backspace through the session's processInput method
    // The TypingSession class handles backspace internally when it receives '\b'
    const input = session.processInput('\b');
    const metrics = session.calculateMetrics();
    const progress = session.getProgress();

    res.json({
      success: true,
      input,
      metrics,
      progress,
      currentPosition: session.currentPosition,
      expectedCharacter: session.expectedCharacter
    });
  } catch (error) {
    console.error('Backspace processing error:', error);
    res.status(500).json({ error: 'Failed to process backspace' });
  }
});

// Complete session
app.post('/api/session/:sessionId/complete', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userId = 'default' } = req.body;

    console.log('[Complete] Request received:', { sessionId, userId });
    console.log('[Complete] Session ID format check:', sessionId, typeof sessionId);

    // Validate inputs
    let validatedSessionId: string;
    try {
      validatedSessionId = InputValidator.validateSessionId(sessionId);
      console.log('[Complete] Session ID validated successfully');
    } catch (validationError) {
      console.error('[Complete] Session ID validation failed:', validationError);
      throw validationError;
    }
    const validatedUserId = InputValidator.validateUserId(userId);

    const session = activeSessions.get(validatedSessionId);

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    if (session.state !== 'completed') {
      session.complete();
    }

    console.log('[Complete] Calculating metrics...');
    const metrics = session.calculateMetrics();
    console.log('[Complete] Metrics calculated:', metrics);

    console.log('[Complete] Calculating detailed metrics...');
    const detailedMetrics = metricsCalculator.calculateDetailedMetrics(session);
    console.log('[Complete] Detailed metrics calculated');

    console.log('[Complete] Elapsed time:', session.getElapsedTime());
    console.log('[Complete] Session language:', session.language);

    // Save to statistics
    console.log('[Complete] Creating session record...');

    // Check if language exists and has proper structure
    if (!session.language) {
      console.error('[Complete] ERROR: session.language is undefined!');
      throw new Error('Session language is undefined');
    }

    console.log('[Complete] Session language type:', typeof session.language);
    console.log('[Complete] Session language constructor:', session.language.constructor.name);

    const record: SessionRecord = {
      sessionId: session.id,
      timestamp: new Date(),
      language: session.language,
      duration: session.getElapsedTime(),
      metrics,
      codeSnippetLength: session.codeSnippet.length,
      difficulty: detailedMetrics.difficulty.score
    };
    console.log('[Complete] Session record created:', record.sessionId);

    console.log('[Complete] Adding session record to repository...');
    await statisticsRepository.addSessionRecord(validatedUserId, record);
    console.log('[Complete] Session record added successfully');

    // Clean up session
    activeSessions.delete(validatedSessionId);
    sessionTimestamps.delete(validatedSessionId);

    // Return with duration in milliseconds for consistency
    res.json({
      metrics,
      detailedMetrics,
      duration: session.getElapsedTime() * 1000  // Convert seconds to milliseconds
    });
  } catch (error) {
    console.error('[Complete] Session complete error:', error);
    console.error('[Complete] Error type:', error?.constructor?.name);
    console.error('[Complete] Error message:', error instanceof Error ? error.message : 'Unknown');
    console.error('[Complete] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    // Return more specific error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = error instanceof Error && error.message.includes('Session ID') ? 400 : 500;

    res.status(statusCode).json({
      error: `Failed to complete session`,
      details: errorMessage
    });
  }
});

// Get user statistics
app.get('/api/statistics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user ID
    const validatedUserId = InputValidator.validateUserId(userId);

    const stats = await statisticsRepository.findByUserId(validatedUserId);

    if (!stats) {
      res.json({
        sessionCount: 0,
        totalPracticeTime: 0,
        averageWPM: 0,
        averageAccuracy: 0
      });
      return;
    }

    const averageMetrics = stats.getAverageMetrics();
    const personalBest = stats.getPersonalBest();
    const progress = stats.getProgressOverTime(7);
    const mostPracticed = stats.getMostPracticedLanguage();

    res.json({
      sessionCount: stats.sessionCount,
      totalPracticeTime: stats.getTotalPracticeTime(),
      totalCharactersTyped: stats.getTotalCharactersTyped(),
      averageMetrics,
      personalBest: personalBest ? {
        wpm: personalBest.metrics.netWPM,
        accuracy: personalBest.metrics.accuracy,
        language: personalBest.language.name,
        date: personalBest.timestamp
      } : null,
      progress,
      mostPracticedLanguage: mostPracticed?.name || null
    });
  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const limitQuery = req.query.limit as string;
    const limit = limitQuery
      ? InputValidator.validateInteger(parseInt(limitQuery), 'limit', 1, 100)
      : 10;

    const leaderboard = await statisticsRepository.getLeaderboard(limit);

    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// Serve index.html for root
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '../../../public/index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`TypeSpeed server running at http://localhost:${port}`);
  console.log('Ready to practice typing with code!');
});