/**
 * UIController Application Service
 * Manages UI state and interactions
 * Single Responsibility: Coordinate UI updates and user inputs
 */
export class UIController {
    constructor() {
        this.initializeElements();
        this.activeView = 'practice';
    }

    initializeElements() {
        // File input
        this.fileInput = document.getElementById('fileInput');
        this.fileCount = document.getElementById('fileCount');

        // Code display
        this.codeDisplay = document.getElementById('codeDisplay');
        this.fileInfo = document.getElementById('fileInfo');
        this.hiddenInput = document.getElementById('hiddenInput');

        // Controls
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');

        // Metrics
        this.wpmDisplay = document.getElementById('wpm');
        this.accuracyDisplay = document.getElementById('accuracy');
        this.timeDisplay = document.getElementById('time');
        this.progressDisplay = document.getElementById('progress');

        // Statistics
        this.totalSessionsDisplay = document.getElementById('totalSessions');
        this.avgWpmDisplay = document.getElementById('avgWpm');
        this.avgAccuracyDisplay = document.getElementById('avgAccuracy');
        this.totalTimeDisplay = document.getElementById('totalTime');
        this.historyTable = document.getElementById('historyTable');
    }

    displayCode(code) {
        // Process code to identify indentation
        let isStartOfLine = true;
        const chars = code.split('').map((char, index) => {
            const span = document.createElement('span');
            span.className = 'char';

            // Mark indentation spaces to be skipped
            if (isStartOfLine && (char === ' ' || char === '\t')) {
                span.classList.add('indent-skip');
                span.style.opacity = '0.3';
            } else if (char !== ' ' && char !== '\t' && char !== '\n') {
                isStartOfLine = false;
            }

            // Reset at new lines
            if (char === '\n') {
                isStartOfLine = true;
            }

            // Handle special characters
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

        // Find first non-indent character
        const firstNonIndent = chars.find(span => !span.classList.contains('indent-skip'));
        if (firstNonIndent) {
            firstNonIndent.classList.add('current');
            // Auto-mark leading indents as correct
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
        // Remove all current markers
        chars.forEach(char => char.classList.remove('current'));
        // Set new current
        if (position < chars.length) {
            chars[position].classList.add('current');
        }
    }

    scrollToCurrentChar() {
        const current = document.querySelector('.char.current');
        if (current) {
            current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    showResults(metrics) {
        alert(`Session Complete!\n\nWPM: ${metrics.netWPM}\nAccuracy: ${metrics.accuracy.toFixed(1)}%\nErrors: ${metrics.errors}\nDuration: ${Math.floor(metrics.duration)}s`);
    }

    switchView(viewName) {
        // Update tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.view === viewName);
        });

        // Update views
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