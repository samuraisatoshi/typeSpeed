// TypeSpeed Application with Direct Typing
class TypeSpeedApp {
  constructor() {
    this.currentSession = null;
    this.currentView = 'practice';
    this.sessionActive = false;
    this.startTime = null;
    this.timer = null;
    this.userId = this.getUserId();
    this.codeLines = [];
    this.currentPosition = 0;
    this.codeSnippet = '';
    this.typedText = '';

    // Initialize presentation layer components (DDD)
    this.viewportManager = null;
    this.codeDisplayPresenter = null;

    // Initialize application services (DDD)
    this.httpClient = null;
    this.feedbackPresenter = null;
    this.sessionCompletionCoordinator = null;

    this.init();
  }

  init() {
    this.initializePresentationLayer();
    this.setupEventListeners();
    this.loadLanguages();
    this.loadSettings();
    this.loadStatistics();
  }

  initializePresentationLayer() {
    const container = document.getElementById('code-container');
    const display = document.getElementById('code-display');

    if (!container || !display) {
      throw new Error('Required DOM elements not found: code-container or code-display');
    }

    // Initialize ViewportManager for scroll control
    this.viewportManager = new ViewportManager(container);

    // Initialize CodeDisplayPresenter with syntax highlighter
    const syntaxHighlighter = {
      highlight: (code, language) => this.applySyntaxHighlighting(code, language)
    };

    this.codeDisplayPresenter = new CodeDisplayPresenter(
      display,
      this.viewportManager,
      syntaxHighlighter
    );

    // Initialize application services
    this.httpClient = new HttpClient();
    this.feedbackPresenter = new FeedbackPresenter();
    this.sessionCompletionCoordinator = new SessionCompletionCoordinator(
      this.httpClient,
      this.feedbackPresenter
    );
  }

  getUserId() {
    let userId = localStorage.getItem('typespeed_user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('typespeed_user_id', userId);
    }
    return userId;
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchView(e.target.dataset.view);
      });
    });

    // Practice controls
    document.getElementById('scan-btn').addEventListener('click', () => this.scanFolder());
    document.getElementById('browse-btn').addEventListener('click', () => this.browseFolder());
    document.getElementById('start-btn').addEventListener('click', () => this.startSession());
    document.getElementById('close-results').addEventListener('click', () => this.closeResults());

    // Direct typing setup
    const codeDisplay = document.getElementById('code-display');
    const hiddenInput = document.getElementById('hidden-input');

    // Focus hidden input when code display is clicked
    codeDisplay.addEventListener('click', () => {
      if (this.sessionActive) {
        hiddenInput.focus();
        codeDisplay.classList.add('typing-active');
      }
    });

    // Handle keyboard input
    hiddenInput.addEventListener('input', (e) => this.handleDirectInput(e));
    hiddenInput.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // Keep focus on hidden input
    hiddenInput.addEventListener('blur', () => {
      if (this.sessionActive) {
        setTimeout(() => hiddenInput.focus(), 0);
      }
    });

    // Settings
    document.getElementById('theme-select').addEventListener('change', (e) => this.setTheme(e.target.value));
    document.getElementById('font-size').addEventListener('input', (e) => this.setFontSize(e.target.value));
    document.getElementById('max-lines').addEventListener('input', (e) => this.setMaxLines(e.target.value));
    document.getElementById('snippet-length').addEventListener('change', (e) => this.setSnippetLength(e.target.value));
    document.getElementById('reset-stats').addEventListener('click', () => this.resetStatistics());
  }

  async loadLanguages() {
    try {
      const response = await fetch('/api/languages');
      const languages = await response.json();

      const select = document.getElementById('language-select');
      select.innerHTML = '<option value="">All Languages</option>';

      languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang.name;
        option.textContent = lang.name;
        select.appendChild(option);
      });
    } catch (error) {
      console.error('Failed to load languages:', error);
      this.showToast('Failed to load languages', 'error');
    }
  }

  switchView(view) {
    this.currentView = view;

    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });

    // Update views
    document.querySelectorAll('.view').forEach(v => {
      v.classList.remove('active');
    });
    document.getElementById(`${view}-view`).classList.add('active');

    // Load view-specific data
    if (view === 'stats') {
      this.loadStatistics();
    }
  }

  browseFolder() {
    // Create a hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.webkitdirectory = true;
    fileInput.directory = true;
    fileInput.multiple = false;

    fileInput.addEventListener('change', (e) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        // Get the common path from the first file
        const firstFilePath = files[0].webkitRelativePath || files[0].name;
        const folderName = firstFilePath.split('/')[0];

        // For security reasons, we can't get the full path in modern browsers
        // So we'll show the folder name and provide instructions
        document.getElementById('folder-input').value = folderName;

        this.showToast(
          `Selected folder: ${folderName}. Note: Due to browser security, you may need to enter the full path manually.`,
          'info'
        );
      }
    });

    // Trigger the file picker
    fileInput.click();
  }

  async scanFolder() {
    const folderPath = document.getElementById('folder-input').value;

    if (!folderPath) {
      this.showToast('Please enter a folder path or browse for a folder', 'warning');
      return;
    }

    const btn = document.getElementById('scan-btn');
    btn.disabled = true;
    btn.textContent = 'Scanning...';

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderPath })
      });

      const result = await response.json();

      if (response.ok) {
        this.showToast(`Found ${result.filesFound} code files`, 'success');
        document.getElementById('start-btn').disabled = false;
      } else {
        this.showToast(result.error || 'Failed to scan folder', 'error');
      }
    } catch (error) {
      this.showToast('Failed to scan folder: ' + error.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Scan Folder';
    }
  }

  async startSession() {
    const language = document.getElementById('language-select').value;
    const maxLines = parseInt(localStorage.getItem('typespeed_max_lines') || '50');

    const btn = document.getElementById('start-btn');
    btn.disabled = true;
    btn.textContent = 'Starting...';

    try {
      const response = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.userId,
          language: language || undefined,
          maxLines: maxLines
        })
      });

      const result = await response.json();

      if (response.ok) {
        this.currentSession = result;
        this.sessionActive = true;
        this.currentPosition = 0;
        this.typedText = '';
        this.codeSnippet = result.codeSnippet;

        // Reset local metrics
        this.localErrors = 0;
        this.localCorrect = 0;

        // Display the code
        this.displayCode(result.codeSnippet);

        // Focus on hidden input
        const hiddenInput = document.getElementById('hidden-input');
        hiddenInput.value = '';
        hiddenInput.focus();

        // Add typing indicator
        const codeDisplay = document.getElementById('code-display');
        codeDisplay.classList.add('typing-active');

        // Start timer
        this.startTimer();

        // Reset metrics
        this.updateMetrics({
          grossWPM: 0,
          netWPM: 0,
          accuracy: 100,
          errors: 0
        });

        this.showToast('Session started! Start typing in the code area.', 'success');
      } else {
        this.showToast(result.error || 'Failed to start session', 'error');
      }
    } catch (error) {
      this.showToast('Failed to start session: ' + error.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Start Typing';
    }
  }

  async displayCode(code) {
    const language = this.currentSession?.language || 'typescript';

    // Use TopScrollStrategy to ensure code starts at the top
    const scrollStrategy = new TopScrollStrategy();

    try {
      // Use CodeDisplayPresenter with ViewportManager for proper scroll control
      await this.codeDisplayPresenter.displayCode(code, language, scrollStrategy);

      // Focus hidden input after display is complete and scroll is set
      const hiddenInput = document.getElementById('hidden-input');
      if (hiddenInput) {
        // Small delay to ensure DOM updates are complete
        setTimeout(() => hiddenInput.focus(), 10);
      }
    } catch (error) {
      console.error('Failed to display code:', error);
      throw new Error(`Code display failed: ${error.message}`);
    }
  }

  applySyntaxHighlighting(code, language) {
    // Basic syntax highlighting for common languages
    const patterns = {
      typescript: {
        keywords: /\b(const|let|var|function|class|interface|type|extends|implements|export|import|from|if|else|for|while|return|new|this|async|await|try|catch|finally|throw|typeof|instanceof|void|null|undefined|true|false)\b/g,
        strings: /(["'`])(?:(?=(\\?))\2.)*?\1/g,
        comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
        numbers: /\b\d+(\.\d+)?\b/g,
        functions: /\b([a-zA-Z_]\w*)\s*(?=\()/g,
        types: /\b(string|number|boolean|any|void|never|unknown|object|Array|Promise)\b/g
      },
      javascript: {
        keywords: /\b(const|let|var|function|class|extends|export|import|from|if|else|for|while|return|new|this|async|await|try|catch|finally|throw|typeof|instanceof|void|null|undefined|true|false)\b/g,
        strings: /(["'`])(?:(?=(\\?))\2.)*?\1/g,
        comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
        numbers: /\b\d+(\.\d+)?\b/g,
        functions: /\b([a-zA-Z_]\w*)\s*(?=\()/g
      },
      python: {
        keywords: /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|raise|with|pass|break|continue|lambda|yield|global|nonlocal|assert|True|False|None|and|or|not|in|is)\b/g,
        strings: /(["'])((?:(?!\1).)*)\1/g,
        comments: /(#.*$|'''[\s\S]*?'''|"""[\s\S]*?""")/gm,
        numbers: /\b\d+(\.\d+)?\b/g,
        functions: /\b(def\s+)([a-zA-Z_]\w*)/g,
        decorators: /@\w+/g
      }
    };

    const languagePatterns = patterns[language.toLowerCase()] || patterns.typescript;

    // Create a map to track replacements
    const replacements = [];

    // Find all matches for each pattern type
    Object.entries(languagePatterns).forEach(([type, pattern]) => {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      while ((match = regex.exec(code)) !== null) {
        replacements.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
          type: type
        });
      }
    });

    // Sort replacements by start position
    replacements.sort((a, b) => a.start - b.start);

    // Remove overlapping replacements (keep the first one)
    const finalReplacements = [];
    let lastEnd = -1;

    for (const replacement of replacements) {
      if (replacement.start >= lastEnd) {
        finalReplacements.push(replacement);
        lastEnd = replacement.end;
      }
    }

    // Build the highlighted code
    let result = '';
    let lastIndex = 0;

    for (const replacement of finalReplacements) {
      // Add unhighlighted text before this replacement
      result += code.substring(lastIndex, replacement.start);

      // Add highlighted text
      const className = replacement.type === 'keywords' ? 'keyword' :
                       replacement.type === 'strings' ? 'string' :
                       replacement.type === 'comments' ? 'comment' :
                       replacement.type === 'numbers' ? 'number' :
                       replacement.type === 'functions' ? 'function' :
                       replacement.type === 'types' ? 'type' :
                       replacement.type === 'decorators' ? 'decorator' : '';

      if (className) {
        result += `<span class="${className}">${replacement.text}</span>`;
      } else {
        result += replacement.text;
      }

      lastIndex = replacement.end;
    }

    // Add remaining unhighlighted text
    result += code.substring(lastIndex);

    return result;
  }

  async handleDirectInput(event) {
    if (!this.sessionActive || !this.currentSession) return;

    const input = event.target;
    const typedChar = input.value.slice(-1);

    if (!typedChar) return;

    // Debug logging for special characters
    if (typedChar === '`') {
      console.log('[Input] Backtick detected:', typedChar);
    }

    // Clear the input immediately for next character
    input.value = '';

    // Process the character
    this.processCharacter(typedChar);
  }

  calculateLocalMetrics(isCorrect) {
    // Track errors locally
    if (!this.localErrors) this.localErrors = 0;
    if (!this.localCorrect) this.localCorrect = 0;

    if (isCorrect) {
      this.localCorrect++;
    } else {
      this.localErrors++;
    }

    const total = this.localCorrect + this.localErrors;
    const accuracy = total > 0 ? (this.localCorrect / total) * 100 : 100;

    // Calculate WPM
    const elapsedSeconds = (Date.now() - this.startTime) / 1000;
    const elapsedMinutes = elapsedSeconds / 60;
    const wordsTyped = this.currentPosition / 5; // Average word length
    const grossWPM = elapsedMinutes > 0 ? wordsTyped / elapsedMinutes : 0;
    const netWPM = Math.max(0, grossWPM - (this.localErrors / elapsedMinutes));

    return {
      grossWPM,
      netWPM,
      accuracy,
      errors: this.localErrors
    };
  }

  updateCharacterDisplayInstant(isCorrect, position) {
    const chars = document.querySelectorAll('.char');

    // Bounds checking - ensure position is valid
    if (position < 0 || position >= chars.length) {
      console.error(`Invalid character position: ${position} (total chars: ${chars.length})`);
      return;
    }

    // Update current character immediately
    const currentChar = chars[position];
    if (!currentChar) {
      console.error(`No character element found at position ${position}`);
      return;
    }

    currentChar.classList.remove('current');
    currentChar.classList.add(isCorrect ? 'correct' : 'incorrect');

    // Move to next character (with bounds check)
    const nextPosition = position + 1;
    if (nextPosition < chars.length) {
      const nextChar = chars[nextPosition];
      if (nextChar) {
        nextChar.classList.add('current');
      }
    }
  }

  async sendInputToServer(typedChar, isCorrect) {
    // Send to server in background without blocking UI
    try {
      // Debug logging for special characters
      if (typedChar === '`') {
        console.log('[Server] Sending backtick to server');
      }

      const response = await fetch(`/api/session/${this.currentSession.sessionId}/input`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character: typedChar })
      });

      if (!response.ok && typedChar === '`') {
        const errorData = await response.json();
        console.error('[Server] Backtick rejected:', errorData);
      }
    } catch (error) {
      console.error('Failed to sync with server:', error);
      // Don't show error to user - the local validation is sufficient
    }
  }

  handleKeyDown(event) {
    if (!this.sessionActive) return;

    // Debug backtick key
    if (event.key === '`') {
      console.log('[KeyDown] Backtick key pressed');
    }

    // Handle special keys
    if (event.key === 'Backspace') {
      event.preventDefault();
      this.handleBackspace();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      // Directly call handleDirectInput with a newline
      this.processCharacter('\n');
    } else if (event.key === '`') {
      // Make sure backtick is not being blocked
      console.log('[KeyDown] Backtick allowed to pass through to input handler');
    }
  }

  processCharacter(char) {
    if (!this.sessionActive || !this.currentSession) return;

    // Debug logging for special characters
    if (char === '`') {
      console.log('[Process] Processing backtick character');
    }

    // Client-side validation
    const expectedChar = this.codeSnippet[this.currentPosition];
    const isCorrect = char === expectedChar;

    // Immediate visual feedback
    this.updateCharacterDisplayInstant(isCorrect, this.currentPosition);

    // Update local state
    this.currentPosition++;
    this.typedText += char;

    // Calculate local metrics for immediate feedback
    const localMetrics = this.calculateLocalMetrics(isCorrect);
    this.updateMetrics(localMetrics);

    // Update progress locally
    const progress = (this.currentPosition / this.codeSnippet.length) * 100;
    document.getElementById('progress-display').textContent = `${Math.round(progress)}%`;

    // Check if session is complete
    if (this.currentPosition >= this.codeSnippet.length) {
      this.completeSession();
      return;
    }

    // Auto-scroll to keep current character visible
    this.scrollToCurrentChar();

    // Send to server asynchronously (non-blocking)
    this.sendInputToServer(char, isCorrect);
  }

  async handleBackspace() {
    if (this.currentPosition <= 0 || !this.currentSession) return;

    // Move back one position
    this.currentPosition--;
    this.typedText = this.typedText.slice(0, -1);

    // Update display
    const chars = document.querySelectorAll('.char');

    // Clear current marker
    chars.forEach(char => char.classList.remove('current'));

    // Reset the character we're moving back to
    if (chars[this.currentPosition]) {
      chars[this.currentPosition].classList.remove('correct', 'incorrect');
      chars[this.currentPosition].classList.add('current');
    }

    // Notify server about backspace
    try {
      await fetch(`/api/session/${this.currentSession.sessionId}/backspace`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Failed to process backspace:', error);
    }
  }

  updateCharacterDisplay(input, position) {
    const chars = document.querySelectorAll('.char');

    // Update previous character
    if (position > 0 && chars[position - 1]) {
      chars[position - 1].classList.remove('current');
      chars[position - 1].classList.add(input.isCorrect ? 'correct' : 'incorrect');
    }

    // Clear all current markers first
    chars.forEach(char => char.classList.remove('current'));

    // Update current character
    if (chars[position]) {
      chars[position].classList.add('current');
    }
  }

  scrollToCurrentChar() {
    const currentChar = document.querySelector('.char.current');

    if (!currentChar) return;

    // Only scroll if we've been typing for a while (not at the start)
    if (this.currentPosition < 10) return;

    // Use SmoothScrollToElementStrategy for progressive scrolling during typing
    const scrollStrategy = new SmoothScrollToElementStrategy(currentChar, {
      buffer: 100,
      minPosition: 10
    });

    this.viewportManager.applyStrategy(scrollStrategy);
  }

  async completeSession() {
    console.log('[Complete] Starting session completion...');
    // CRITICAL FIX: DO NOT change sessionActive until after async operations complete
    // This prevents the race condition where UI updates happen before server response

    // Validate session is ready for completion
    if (!this.currentSession) {
      console.error('Cannot complete session: no active session');
      this.feedbackPresenter.showError('No active session to complete');
      return;
    }

    console.log('[Complete] Current session:', this.currentSession);
    console.log('[Complete] Session ID:', this.currentSession.sessionId);
    console.log('[Complete] User ID:', this.userId);

    try {
      // Step 1: Validate session state
      this.sessionCompletionCoordinator.validateSessionForCompletion(this.currentSession);

      // Step 2: Send completion request and wait for response (BLOCKING)
      // This is the critical fix - we wait for the server response before changing state
      const completionResult = await this.sessionCompletionCoordinator.completeSession(
        this.currentSession.sessionId,
        this.userId  // FIX: Now properly sending userId
      );

      // Step 3: ONLY after successful completion, update local state
      // This ensures UI updates happen in correct sequence
      this.sessionActive = false;
      this.stopTimer();

      // Step 4: Update UI indicators
      document.getElementById('code-display').classList.remove('typing-active');
      document.getElementById('hidden-input').blur();

      // Step 5: Display results to user
      this.displayResults(completionResult);

      // Step 6: Refresh statistics
      this.loadStatistics();

    } catch (error) {
      // Error handling with proper user feedback
      console.error('Session completion failed:', error);

      // Keep session active if completion failed
      // User can retry or abort manually
      if (error.name === 'SessionCompletionError') {
        this.feedbackPresenter.showError(error.getUserMessage());

        // If recoverable, suggest retry
        if (error.isRecoverable()) {
          setTimeout(() => {
            this.feedbackPresenter.showInfo('You can try completing the session again');
          }, 3000);
        }
      } else {
        this.feedbackPresenter.showError('Failed to complete session. Please try again.');
      }
    }
  }

  displayResults(result) {
    const modal = document.getElementById('results-modal');
    const content = document.getElementById('results-content');

    // Support both SessionCompletionResult value object and legacy format
    const duration = result.duration || 0;
    const metrics = result.metrics || {};

    // Use value object methods if available, otherwise fallback to direct access
    const formattedDuration = result.getFormattedDuration ?
      result.getFormattedDuration() :
      this.formatTime(duration);

    const wpm = result.getRoundedWPM ?
      result.getRoundedWPM() :
      { netWPM: Math.round(metrics.netWPM || 0), grossWPM: Math.round(metrics.grossWPM || 0) };

    const accuracy = result.getFormattedAccuracy ?
      result.getFormattedAccuracy() :
      (metrics.accuracy || 0).toFixed(1);

    content.innerHTML = `
      <div class="result-item">
        <span class="result-label">Duration</span>
        <span class="result-value">${formattedDuration}</span>
      </div>
      <div class="result-item">
        <span class="result-label">Net WPM</span>
        <span class="result-value">${wpm.netWPM}</span>
      </div>
      <div class="result-item">
        <span class="result-label">Gross WPM</span>
        <span class="result-value">${wpm.grossWPM}</span>
      </div>
      <div class="result-item">
        <span class="result-label">Accuracy</span>
        <span class="result-value">${accuracy}%</span>
      </div>
      <div class="result-item">
        <span class="result-label">Total Characters</span>
        <span class="result-value">${metrics.totalCharacters || 0}</span>
      </div>
      <div class="result-item">
        <span class="result-label">Errors</span>
        <span class="result-value">${metrics.errors || 0}</span>
      </div>
    `;

    modal.classList.add('active');
  }

  closeResults() {
    document.getElementById('results-modal').classList.remove('active');
    this.currentSession = null;

    // Reset display using presenter
    this.codeDisplayPresenter.displayPlaceholder(
      'Click "Scan Folder" to load code files, then "Start Typing" to begin'
    );
  }

  startTimer() {
    this.startTime = Date.now();
    this.timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      document.getElementById('time-display').textContent = this.formatTime(elapsed * 1000);
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  updateMetrics(metrics) {
    document.getElementById('wpm-display').textContent = Math.round(metrics.netWPM);
    document.getElementById('accuracy-display').textContent = `${metrics.accuracy.toFixed(1)}%`;
  }

  formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  async loadStatistics() {
    try {
      const response = await fetch(`/api/stats/${this.userId}`);
      const stats = await response.json();

      if (response.ok) {
        document.getElementById('total-sessions').textContent = stats.totalSessions;
        document.getElementById('avg-wpm').textContent = Math.round(stats.averageWPM);
        document.getElementById('avg-accuracy').textContent = `${stats.averageAccuracy.toFixed(1)}%`;
        document.getElementById('practice-time').textContent = `${Math.round(stats.totalPracticeTime / 60)} min`;
        document.getElementById('personal-best').textContent = `${Math.round(stats.personalBestWPM)} WPM`;
        document.getElementById('fav-language').textContent = stats.favoriteLanguage || 'None';
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  }

  resetStatistics() {
    if (confirm('Are you sure you want to reset all your statistics?')) {
      localStorage.removeItem('typespeed_user_id');
      this.userId = this.getUserId();
      this.loadStatistics();
      this.showToast('Statistics reset successfully', 'success');
    }
  }

  loadSettings() {
    // Load theme
    const theme = localStorage.getItem('typespeed_theme') || 'light';
    this.setTheme(theme);
    document.getElementById('theme-select').value = theme;

    // Load font size
    const fontSize = localStorage.getItem('typespeed_font_size') || '16';
    this.setFontSize(fontSize);
    document.getElementById('font-size').value = fontSize;

    // Load max lines
    const maxLines = localStorage.getItem('typespeed_max_lines') || '50';
    this.setMaxLines(maxLines);
    document.getElementById('max-lines').value = maxLines;

    // Load snippet length
    const snippetLength = localStorage.getItem('typespeed_snippet_length') || 'medium';
    this.setSnippetLength(snippetLength);
    document.getElementById('snippet-length').value = snippetLength;
  }

  setTheme(theme) {
    document.body.className = theme === 'dark' ? 'dark' : '';
    localStorage.setItem('typespeed_theme', theme);
  }

  setFontSize(size) {
    document.querySelector('.code-display').style.fontSize = `${size}px`;
    document.getElementById('font-size-value').textContent = `${size}px`;
    localStorage.setItem('typespeed_font_size', size);
  }

  setMaxLines(lines) {
    document.getElementById('max-lines-value').textContent = `${lines} lines`;
    localStorage.setItem('typespeed_max_lines', lines);
  }

  setSnippetLength(length) {
    localStorage.setItem('typespeed_snippet_length', length);
  }

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  // Feedback notification system - Delegated to FeedbackPresenter
  showToast(message, type = 'info') {
    // Delegate to FeedbackPresenter for proper separation of concerns
    switch (type) {
      case 'error':
        this.feedbackPresenter.showError(message);
        break;
      case 'success':
        this.feedbackPresenter.showSuccess(message);
        break;
      case 'warning':
        this.feedbackPresenter.showWarning(message);
        break;
      default:
        this.feedbackPresenter.showInfo(message);
    }
  }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  new TypeSpeedApp();
});