// TypeSpeed Standalone Application - Works without ES6 modules

// Domain Layer - TypingSession
class TypingSession {
    constructor(codeSnippet, file) {
        // Generate unique ID using timestamp + random number to avoid collisions
        this.id = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        this.code = codeSnippet;
        this.file = file;
        this.language = file.language;
        this.filename = file.path || file.name;
        this.startTime = null;
        this.endTime = null;
        this.currentPosition = 0;
        this.errors = 0;
        this.correctChars = 0;
        this.totalChars = 0;
        this.isActive = false;
    }

    start() {
        if (!this.startTime) {
            this.startTime = Date.now();
            this.isActive = true;
        }
    }

    end() {
        if (this.isActive) {
            this.endTime = Date.now();
            this.isActive = false;
        }
    }

    getDuration() {
        if (!this.startTime) return 0;
        const endTime = this.endTime || Date.now();
        return (endTime - this.startTime) / 1000;
    }

    processInput(typedChar, expectedChar) {
        const isCorrect = typedChar === expectedChar;
        if (isCorrect) {
            this.correctChars++;
        } else {
            this.errors++;
        }
        this.totalChars++;
        return isCorrect;
    }

    moveToNextPosition() {
        this.currentPosition++;
    }

    moveToPreviousPosition() {
        if (this.currentPosition > 0) {
            this.currentPosition--;
        }
    }

    isComplete() {
        return this.currentPosition >= this.code.length;
    }

    getMetrics() {
        const duration = this.getDuration();
        const minutes = duration / 60;
        const words = this.totalChars / 5;
        const grossWPM = minutes > 0 ? words / minutes : 0;
        const netWPM = minutes > 0 ? (words - this.errors) / minutes : 0;
        const accuracy = this.totalChars > 0 ? (this.correctChars / this.totalChars) * 100 : 0;

        return {
            grossWPM: Math.round(grossWPM),
            netWPM: Math.round(netWPM),
            accuracy: Math.min(100, accuracy),
            errors: this.errors,
            duration: duration
        };
    }
}

// Domain Layer - CodeFileRepository
class CodeFileRepository {
    constructor() {
        this.files = [];
        this.supportedExtensions = [
            'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'h', 'hpp',
            'rs', 'go', 'rb', 'swift', 'kt', 'scala', 'php', 'cs',
            'sh', 'bash', 'sql', 'r', 'lua', 'dart', 'vue', 'svelte'
        ];
    }

    async loadFromFileList(fileList) {
        this.files = [];
        const files = Array.from(fileList);

        for (const file of files) {
            if (this.isValidCodeFile(file)) {
                try {
                    const content = await this.readFile(file);
                    const lines = content.split('\n');

                    if (lines.length >= 10) {
                        this.files.push({
                            name: file.name,
                            path: file.webkitRelativePath || file.name,
                            content: content,
                            language: this.detectLanguage(file.name),
                            lines: lines.length,
                            size: file.size
                        });
                    }
                } catch (error) {
                    console.warn(`Failed to read file ${file.name}:`, error);
                }
            }
        }

        return this.files.length;
    }

    isValidCodeFile(file) {
        const ext = file.name.split('.').pop()?.toLowerCase();
        return ext &&
               this.supportedExtensions.includes(ext) &&
               file.size >= 50 &&
               file.size <= 500000;
    }

    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    detectLanguage(filename) {
        const ext = filename.split('.').pop()?.toLowerCase();
        const languages = {
            'js': 'JavaScript', 'jsx': 'JavaScript',
            'ts': 'TypeScript', 'tsx': 'TypeScript',
            'py': 'Python', 'java': 'Java',
            'cpp': 'C++', 'c': 'C', 'h': 'C', 'hpp': 'C++',
            'rs': 'Rust', 'go': 'Go', 'rb': 'Ruby',
            'swift': 'Swift', 'kt': 'Kotlin',
            'scala': 'Scala', 'php': 'PHP', 'cs': 'C#',
            'sh': 'Bash', 'bash': 'Bash', 'sql': 'SQL',
            'r': 'R', 'lua': 'Lua', 'dart': 'Dart',
            'vue': 'Vue', 'svelte': 'Svelte'
        };
        return languages[ext] || 'Unknown';
    }

    getRandomFile() {
        if (this.files.length === 0) return null;
        return this.files[Math.floor(Math.random() * this.files.length)];
    }

    getFileCount() {
        return this.files.length;
    }

    hasFiles() {
        return this.files.length > 0;
    }
}

// Domain Layer - Statistics
class Statistics {
    constructor() {
        this.storageKey = 'typespeed_statistics';
        this.sessions = this.loadFromStorage();
    }

    loadFromStorage() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.sessions));
        } catch (error) {
            console.error('Failed to save statistics:', error);
        }
    }

    addSession(session, metrics) {
        const sessionData = {
            id: session.id,
            date: new Date().toISOString(),
            language: session.language,
            duration: metrics.duration,
            wpm: metrics.netWPM,
            grossWPM: metrics.grossWPM,
            accuracy: metrics.accuracy,
            errors: metrics.errors,
            charactersTyped: session.totalChars
        };

        this.sessions.push(sessionData);

        if (this.sessions.length > 100) {
            this.sessions = this.sessions.slice(-100);
        }

        this.saveToStorage();
        return sessionData;
    }

    getAverageMetrics() {
        if (this.sessions.length === 0) {
            return { wpm: 0, accuracy: 0, sessionsCount: 0 };
        }

        const totalWpm = this.sessions.reduce((sum, s) => sum + s.wpm, 0);
        const totalAccuracy = this.sessions.reduce((sum, s) => sum + s.accuracy, 0);

        return {
            wpm: Math.round(totalWpm / this.sessions.length),
            accuracy: Math.round(totalAccuracy / this.sessions.length),
            sessionsCount: this.sessions.length
        };
    }

    getTotalPracticeTime() {
        const totalSeconds = this.sessions.reduce((sum, s) => sum + s.duration, 0);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }

    getTotalCharactersTyped() {
        return this.sessions.reduce((sum, s) => sum + (s.charactersTyped || 0), 0);
    }

    getRecentSessions(limit = 10) {
        return this.sessions.slice(-limit).reverse();
    }

    getBestSession() {
        if (this.sessions.length === 0) return null;
        return this.sessions.reduce((best, current) =>
            current.wpm > best.wpm ? current : best
        );
    }

    getSessionsByLanguage(language) {
        return this.sessions.filter(s => s.language === language);
    }

    clearAll() {
        this.sessions = [];
        this.saveToStorage();
    }

    deleteSession(sessionId) {
        // Handle both old numeric IDs and new string IDs
        // For old sessions, the ID might be a number in storage
        this.sessions = this.sessions.filter(s => {
            // Compare both as strings to handle mixed ID types
            return String(s.id) !== String(sessionId);
        });
        this.saveToStorage();
    }
}

// Domain Layer - CodeSnippetSelector
class CodeSnippetSelector {
    selectSnippet(content, maxLines = 50) {
        const lines = content.split('\n');

        if (lines.length <= maxLines) {
            return content;
        }

        let bestSnippet = null;
        let bestScore = -1;

        for (let attempt = 0; attempt < 5; attempt++) {
            const startLine = Math.floor(Math.random() * Math.max(1, lines.length - maxLines));
            const snippet = lines.slice(startLine, startLine + maxLines);

            const score = this.scoreSnippet(snippet);

            if (score > bestScore) {
                bestScore = score;
                bestSnippet = snippet;
            }

            if (score > 0.6) {
                break;
            }
        }

        return bestSnippet ? bestSnippet.join('\n') :
               lines.slice(0, maxLines).join('\n');
    }

    scoreSnippet(lines) {
        let nonEmptyLines = 0;
        let codeLines = 0;
        const totalLines = lines.length;

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.length > 0) {
                nonEmptyLines++;
                if (!this.isCommentOrImport(trimmed)) {
                    codeLines++;
                }
            }
        }

        return (nonEmptyLines / totalLines) * 0.5 + (codeLines / totalLines) * 0.5;
    }

    isCommentOrImport(line) {
        return line.startsWith('//') ||
               line.startsWith('#') ||
               line.startsWith('/*') ||
               line.startsWith('*') ||
               line.startsWith('import') ||
               line.startsWith('from') ||
               line.startsWith('using') ||
               line.startsWith('include');
    }
}

// Infrastructure Layer - InputHandler
class InputHandler {
    constructor() {
        this.onCharacter = null;
        this.onBackspace = null;
        this.onEnter = null;
        this.inputElement = null;
    }

    attachTo(inputElement) {
        this.inputElement = inputElement;

        inputElement.addEventListener('input', (e) => {
            const typedChar = e.target.value;
            if (typedChar && this.onCharacter) {
                this.onCharacter(typedChar);
            }
            e.target.value = '';
        });

        inputElement.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace') {
                e.preventDefault();
                if (this.onBackspace) {
                    this.onBackspace();
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (this.onEnter) {
                    this.onEnter();
                }
                inputElement.value = '';
            }
        });
    }

    detach() {
        if (this.inputElement) {
            this.inputElement = null;
        }
    }
}

// Application Layer - UIController
class UIController {
    constructor() {
        this.initializeElements();
        this.activeView = 'practice';
    }

    initializeElements() {
        this.fileInput = document.getElementById('fileInput');
        this.fileCount = document.getElementById('fileCount');
        this.codeDisplay = document.getElementById('codeDisplay');
        this.fileInfo = document.getElementById('fileInfo');
        this.hiddenInput = document.getElementById('hiddenInput');
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.wpmDisplay = document.getElementById('wpm');
        this.accuracyDisplay = document.getElementById('accuracy');
        this.timeDisplay = document.getElementById('time');
        this.progressDisplay = document.getElementById('progress');
        this.totalSessionsDisplay = document.getElementById('totalSessions');
        this.avgWpmDisplay = document.getElementById('avgWpm');
        this.avgAccuracyDisplay = document.getElementById('avgAccuracy');
        this.totalTimeDisplay = document.getElementById('totalTime');
        this.historyTable = document.getElementById('historyTable');
    }

    displayCode(code) {
        let isStartOfLine = true;
        const chars = code.split('').map((char, index) => {
            const span = document.createElement('span');
            span.className = 'char';

            if (isStartOfLine && (char === ' ' || char === '\t')) {
                span.classList.add('indent-skip');
                span.style.opacity = '0.3';
            } else if (char !== ' ' && char !== '\t' && char !== '\n') {
                isStartOfLine = false;
            }

            if (char === '\n') {
                isStartOfLine = true;
            }

            if (char === ' ') {
                span.innerHTML = '<span class="space-indicator" style="opacity: 0.3;">·</span>';
                span.classList.add('space');
            } else if (char === '\n') {
                span.innerHTML = '<span class="newline-indicator" style="opacity: 0.3;">↵</span>\n';
                span.classList.add('newline');
            } else if (char === '\t') {
                span.innerHTML = '<span class="tab-indicator" style="opacity: 0.3;">→</span>';
                span.classList.add('tab');
            } else {
                span.textContent = char;
            }

            span.dataset.char = char;
            span.dataset.index = index;
            return span;
        });

        this.codeDisplay.innerHTML = '';
        chars.forEach(span => this.codeDisplay.appendChild(span));

        const firstNonIndent = chars.find(span => !span.classList.contains('indent-skip'));
        if (firstNonIndent) {
            firstNonIndent.classList.add('current');
            for (const char of chars) {
                if (char.classList.contains('indent-skip')) {
                    char.classList.add('correct');
                } else {
                    break;
                }
            }
        } else if (chars.length > 0) {
            chars[0].classList.add('current');
        }

        return chars;
    }

    displayFileInfo(file) {
        if (this.fileInfo && file) {
            this.fileInfo.textContent = `📄 ${file.path || file.name} (${file.language})`;
        }
    }

    updateMetrics(metrics) {
        if (this.wpmDisplay) this.wpmDisplay.textContent = metrics.netWPM || 0;
        if (this.accuracyDisplay) this.accuracyDisplay.textContent = `${metrics.accuracy.toFixed(1)}%`;
        if (this.progressDisplay) this.progressDisplay.textContent = `${metrics.progress || 0}%`;
    }

    updateTimer(seconds) {
        if (this.timeDisplay) {
            const minutes = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            this.timeDisplay.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }

    updateStatistics(stats) {
        const avg = stats.getAverageMetrics();

        if (this.totalSessionsDisplay) {
            this.totalSessionsDisplay.textContent = avg.sessionsCount;
        }
        if (this.avgWpmDisplay) {
            this.avgWpmDisplay.textContent = avg.wpm;
        }
        if (this.avgAccuracyDisplay) {
            this.avgAccuracyDisplay.textContent = `${avg.accuracy}%`;
        }
        if (this.totalTimeDisplay) {
            this.totalTimeDisplay.textContent = stats.getTotalPracticeTime();
        }

        this.updateHistoryTable(stats.getRecentSessions());
    }

    updateHistoryTable(sessions) {
        if (!this.historyTable) return;

        this.historyTable.innerHTML = sessions.map(session => {
            const date = new Date(session.date);
            return `
                <tr>
                    <td>${date.toLocaleDateString()} ${date.toLocaleTimeString()}</td>
                    <td>${session.language}</td>
                    <td>${session.wpm} WPM</td>
                    <td>${session.accuracy.toFixed(1)}%</td>
                    <td>${Math.floor(session.duration)}s</td>
                    <td>
                        <button class="delete-btn" onclick="deleteSession('${session.id}')">
                            🗑️ Delete
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    updateFileCount(count) {
        if (this.fileCount) {
            this.fileCount.textContent = `${count} code file(s) loaded`;
        }
    }

    updateCharacterDisplay(position, isCorrect) {
        const chars = document.querySelectorAll('.char');
        if (position < chars.length) {
            chars[position].classList.remove('current');
            chars[position].classList.add(isCorrect ? 'correct' : 'incorrect');
        }
    }

    setCurrentPosition(position) {
        const chars = document.querySelectorAll('.char');
        chars.forEach(char => char.classList.remove('current'));
        if (position < chars.length) {
            chars[position].classList.add('current');
        }
    }

    scrollToCurrentChar() {
        // Only scroll if the current character is not visible
        const current = document.querySelector('.char.current');
        if (current) {
            const rect = current.getBoundingClientRect();
            const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

            // Only scroll if the character is outside the viewport
            if (!isVisible) {
                // Use a gentler scroll that doesn't force center alignment
                current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',  // Changed from 'center' to 'nearest' to minimize jumping
                    inline: 'nearest'
                });
            }
        }
    }

    showResults(metrics) {
        // Update modal content
        document.getElementById('modalWPM').textContent = metrics.netWPM;
        document.getElementById('modalAccuracy').textContent = `${metrics.accuracy.toFixed(1)}%`;
        document.getElementById('modalErrors').textContent = metrics.errors;
        document.getElementById('modalDuration').textContent = `${Math.floor(metrics.duration)}s`;

        // Show modal
        const modal = document.getElementById('resultsModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    switchView(viewName) {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.view === viewName);
        });

        document.querySelectorAll('.view').forEach(view => {
            view.classList.toggle('active', view.id === viewName);
        });

        this.activeView = viewName;
    }

    setStartButtonText(text) {
        if (this.startBtn) {
            this.startBtn.textContent = text;
        }
    }

    setStartButtonEnabled(enabled) {
        if (this.startBtn) {
            this.startBtn.disabled = !enabled;
        }
    }

    setResetButtonVisible(visible) {
        if (this.resetBtn) {
            this.resetBtn.style.display = visible ? 'inline-block' : 'none';
        }
    }

    clearCodeDisplay() {
        if (this.codeDisplay) {
            this.codeDisplay.innerHTML = '<div class="placeholder">Select a folder containing code files and click "Start Typing" to begin practicing</div>';
        }
        if (this.fileInfo) {
            this.fileInfo.textContent = '';
        }
    }

    focusInput() {
        if (this.hiddenInput) {
            this.hiddenInput.focus();
        }
    }
}

// Application Layer - Main App
class TypingApp {
    constructor() {
        this.codeRepository = new CodeFileRepository();
        this.statistics = new Statistics();
        this.snippetSelector = new CodeSnippetSelector();
        this.ui = new UIController();
        this.inputHandler = new InputHandler();
        this.currentSession = null;
        this.timerInterval = null;

        this.initialize();
    }

    initialize() {
        this.ui.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.ui.startBtn.addEventListener('click', () => this.startSession());
        this.ui.resetBtn.addEventListener('click', () => this.resetSession());

        this.inputHandler.onCharacter = (char) => this.handleCharacterInput(char);
        this.inputHandler.onBackspace = () => this.handleBackspace();
        this.inputHandler.onEnter = () => this.handleCharacterInput('\n');

        this.inputHandler.attachTo(this.ui.hiddenInput);

        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.ui.switchView(e.target.dataset.view);
                if (e.target.dataset.view === 'statistics') {
                    this.ui.updateStatistics(this.statistics);
                }
            });
        });

        document.addEventListener('click', () => {
            if (this.currentSession && this.currentSession.isActive) {
                this.ui.focusInput();
            }
        });

        this.ui.updateStatistics(this.statistics);
    }

    async handleFileSelect(event) {
        const count = await this.codeRepository.loadFromFileList(event.target.files);
        this.ui.updateFileCount(count);
        this.ui.setStartButtonEnabled(count > 0);

        if (count === 0) {
            alert('No valid code files found in the selected folder. Please select a folder containing source code files.');
        }
    }

    startSession() {
        if (!this.codeRepository.hasFiles()) {
            alert('Please select a folder containing code files first');
            return;
        }

        const file = this.codeRepository.getRandomFile();
        const maxLines = parseInt(document.getElementById('maxLines')?.value) || 50;
        const snippet = this.snippetSelector.selectSnippet(file.content, maxLines);

        this.currentSession = new TypingSession(snippet, file);

        this.ui.displayCode(snippet);
        this.ui.displayFileInfo(file);
        this.ui.setStartButtonText('New Snippet');
        this.ui.setResetButtonVisible(true);
        this.ui.focusInput();

        this.ui.updateMetrics({
            netWPM: 0,
            accuracy: 100,
            progress: 0
        });
        this.ui.updateTimer(0);

        this.skipIndentation();
    }

    resetSession() {
        if (this.currentSession) {
            this.currentSession.end();
        }
        this.currentSession = null;

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        this.ui.clearCodeDisplay();
        this.ui.setStartButtonText('Start Typing');
        this.ui.setResetButtonVisible(false);
        this.ui.updateMetrics({
            netWPM: 0,
            accuracy: 100,
            progress: 0
        });
        this.ui.updateTimer(0);
    }

    handleCharacterInput(typedChar) {
        if (!this.currentSession || !this.currentSession.isActive && !this.currentSession.startTime) {
            if (this.currentSession) {
                this.currentSession.start();
                this.startTimer();
            } else {
                return;
            }
        }

        this.skipIndentation();

        const chars = document.querySelectorAll('.char');
        if (this.currentSession.currentPosition >= chars.length) {
            return;
        }

        const currentChar = chars[this.currentSession.currentPosition];
        const expectedChar = currentChar.dataset.char;

        const isCorrect = this.currentSession.processInput(typedChar, expectedChar);

        this.ui.updateCharacterDisplay(this.currentSession.currentPosition, isCorrect);

        this.currentSession.moveToNextPosition();
        this.skipIndentation();

        if (this.currentSession.currentPosition < chars.length) {
            this.ui.setCurrentPosition(this.currentSession.currentPosition);
            // Only scroll occasionally, not on every keystroke
            // This prevents the annoying jumping while typing
            if (this.currentSession.currentPosition % 50 === 0) {
                // Check scrolling only every 50 characters
                this.ui.scrollToCurrentChar();
            }
        }

        const metrics = this.currentSession.getMetrics();
        metrics.progress = Math.floor((this.currentSession.currentPosition / chars.length) * 100);
        this.ui.updateMetrics(metrics);

        if (this.currentSession.isComplete()) {
            this.completeSession();
        }
    }

    handleBackspace() {
        if (!this.currentSession || this.currentSession.currentPosition === 0) {
            return;
        }

        this.currentSession.moveToPreviousPosition();

        const chars = document.querySelectorAll('.char');
        while (this.currentSession.currentPosition > 0 &&
               chars[this.currentSession.currentPosition].classList.contains('indent-skip')) {
            this.currentSession.moveToPreviousPosition();
        }

        const currentChar = chars[this.currentSession.currentPosition];
        if (currentChar && !currentChar.classList.contains('indent-skip')) {
            currentChar.classList.remove('correct', 'incorrect', 'current');
            currentChar.classList.add('current');
        }

        const metrics = this.currentSession.getMetrics();
        metrics.progress = Math.floor((this.currentSession.currentPosition / chars.length) * 100);
        this.ui.updateMetrics(metrics);
    }

    skipIndentation() {
        if (!this.currentSession) return;

        const chars = document.querySelectorAll('.char');
        while (this.currentSession.currentPosition < chars.length &&
               chars[this.currentSession.currentPosition].classList.contains('indent-skip')) {
            chars[this.currentSession.currentPosition].classList.remove('current');
            chars[this.currentSession.currentPosition].classList.add('correct');
            this.currentSession.currentPosition++;
        }
    }

    startTimer() {
        if (this.timerInterval) return;

        this.timerInterval = setInterval(() => {
            if (this.currentSession && this.currentSession.isActive) {
                this.ui.updateTimer(this.currentSession.getDuration());
            }
        }, 100);
    }

    completeSession() {
        if (!this.currentSession) return;

        this.currentSession.end();
        const metrics = this.currentSession.getMetrics();

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        this.statistics.addSession(this.currentSession, metrics);

        this.ui.showResults(metrics);

        this.currentSession = null;
        this.ui.setStartButtonText('Start Typing');
        this.ui.setResetButtonVisible(false);
    }
}

// Splash Screen Management
function closeSplash() {
    const dontShowAgain = document.getElementById('dontShowAgain').checked;
    if (dontShowAgain) {
        localStorage.setItem('typespeed_hide_splash', 'true');
    }

    const splash = document.getElementById('splashScreen');
    if (splash) {
        splash.classList.add('hidden');
    }
}

function showSplashIfNeeded() {
    const hideSplash = localStorage.getItem('typespeed_hide_splash');
    const splash = document.getElementById('splashScreen');

    if (!hideSplash && splash) {
        splash.classList.remove('hidden');
    } else if (splash) {
        splash.classList.add('hidden');
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        showSplashIfNeeded();
        appInstance = new TypingApp();
    });
} else {
    showSplashIfNeeded();
    appInstance = new TypingApp();
}

// Make closeSplash available globally
window.closeSplash = closeSplash;

// Modal control functions
function closeResultsModal() {
    const modal = document.getElementById('resultsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function newSnippetFromModal() {
    closeResultsModal();
    // Trigger new snippet
    const newSnippetBtn = document.getElementById('newSnippetBtn');
    if (newSnippetBtn) {
        newSnippetBtn.click();
    }
}

// Make modal functions available globally
window.closeResultsModal = closeResultsModal;
window.newSnippetFromModal = newSnippetFromModal;

// Global functions for deleting sessions
let appInstance = null;

function deleteSession(sessionId) {
    if (confirm('Are you sure you want to delete this session?')) {
        if (appInstance && appInstance.statistics) {
            console.log('Deleting session:', sessionId);
            const beforeCount = appInstance.statistics.sessions.length;
            appInstance.statistics.deleteSession(sessionId);
            const afterCount = appInstance.statistics.sessions.length;
            console.log(`Sessions before: ${beforeCount}, after: ${afterCount}`);
            appInstance.ui.updateStatistics(appInstance.statistics);
        } else {
            console.error('App instance or statistics not available');
        }
    }
}

function clearAllSessions() {
    if (confirm('Are you sure you want to clear all sessions? This action cannot be undone.')) {
        if (appInstance) {
            appInstance.statistics.clearAll();
            appInstance.ui.updateStatistics(appInstance.statistics);
        }
    }
}

// Make delete functions available globally
window.deleteSession = deleteSession;
window.clearAllSessions = clearAllSessions;