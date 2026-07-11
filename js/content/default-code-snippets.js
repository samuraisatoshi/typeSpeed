// Default practice content: real source excerpts from this project (TypeSpeed itself).
// Used as the initial code pool so the app has something to practice with
// before the user picks their own folder (see PracticeCategoryProvider).
const DEFAULT_CODE_FILES = [
    {
        name: 'TypingSession.js',
        path: 'js/domain/TypingSession.js',
        language: 'JavaScript',
        content: `class TypingSession {
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
}`
    },
    {
        name: 'styles.css',
        path: 'css/styles.css',
        language: 'CSS',
        content: `.typing-area {
    background: #1e293b;
    border-radius: 12px;
    padding: 30px;
    margin-bottom: 20px;
    min-height: 400px;
    max-height: 600px;
    overflow-y: auto;
    position: relative;
}

.code-display {
    font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
    font-size: 16px;
    line-height: 1.6;
    white-space: pre;
    overflow-x: auto;
    overflow-y: auto;
    max-height: 60vh;
    position: relative;
    scroll-behavior: auto;
}

.char {
    position: relative;
    color: #94a3b8;
}

.char.current {
    background: #fbbf24;
    color: #000 !important;
    border-radius: 2px;
    position: relative;
    font-weight: bold;
    min-width: 8px;
}

.char.current:not(.newline) {
    display: inline-block;
}

.char.current .space-indicator,
.char.current .newline-indicator,
.char.current .tab-indicator {
    opacity: 1 !important;
    color: #000 !important;
    font-weight: bold;
}

.char.current::before {
    content: '';
    position: absolute;
    left: -3px;
    top: -2px;
    bottom: -2px;
    width: 4px;
    background: #ff6b6b;
    border-radius: 2px;
}

.char.correct {
    color: #34d399;
}

.char.incorrect {
    color: #fca5a5;
    background: rgba(239, 68, 68, 0.1);
}`
    },
    {
        name: 'index.html',
        path: 'index.html',
        language: 'HTML',
        content: `<div id="practice" class="view active">
    <div class="file-input-section">
        <div class="file-input-wrapper">
            <label for="fileInput" class="file-label">
                Select Code Folder
            </label>
            <input type="file" id="fileInput" webkitdirectory multiple>
            <span class="file-count" id="fileCount">No files loaded</span>
        </div>
    </div>

    <div class="metrics-bar">
        <div class="metric metric-primary">
            <div class="metric-value" id="wpm">0</div>
            <div class="metric-label">WPM</div>
        </div>
        <div class="metric metric-secondary">
            <div class="metric-value" id="accuracy">100%</div>
            <div class="metric-label">Accuracy</div>
        </div>
        <div class="metric metric-secondary">
            <div class="metric-value" id="time">0:00</div>
            <div class="metric-label">Time</div>
        </div>
        <div class="metric metric-secondary">
            <div class="metric-value" id="progress">0%</div>
            <div class="metric-label">Progress</div>
        </div>
    </div>

    <div class="typing-area" id="typingArea">
        <div id="fileInfo"></div>
        <div class="code-display" id="codeDisplay"></div>
    </div>
</div>`
    }
];

