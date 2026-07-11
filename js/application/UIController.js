// Application Layer - UIController
class UIController {
    constructor() {
        this.initializeElements();
        this.activeView = 'practice';
    }

    initializeElements() {
        this.categorySelect = document.getElementById('categorySelect');
        this.fileInputSection = document.querySelector('.file-input-section');
        this.fileInput = document.getElementById('fileInput');
        this.fileCount = document.getElementById('fileCount');
        this.codeDisplay = document.getElementById('codeDisplay');
        this.fileInfo = document.getElementById('fileInfo');
        this.hiddenInput = document.getElementById('hiddenInput');
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.metricsBar = document.querySelector('.metrics-bar');
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

    displayCode(code, isTextMode = false) {
        this.codeDisplay.classList.toggle('wrap-text', isTextMode);
        let isStartOfLine = true;
        let lineIndex = 0;
        const lineSpans = [[]];
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
                span.innerHTML = '<span class="space-indicator" style="opacity: 0.3;">·</span>​';
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
            span.dataset.line = lineIndex;
            lineSpans[lineIndex].push(span);
            if (char === '\n') {
                lineIndex++;
                lineSpans.push([]);
            }
            return span;
        });

        this.codeDisplay.innerHTML = '';
        chars.forEach(span => this.codeDisplay.appendChild(span));
        this.lineSpans = lineSpans;
        this.activeLineIndex = null;

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
            this.highlightLine(parseInt(firstNonIndent.dataset.line, 10));
        } else if (chars.length > 0) {
            chars[0].classList.add('current');
            this.highlightLine(parseInt(chars[0].dataset.line, 10));
        }

        this.charElements = chars;
        return chars;
    }

    /* Typewriter-lens effect: the line the cursor is on renders larger
       (.line-active), everything else shrinks — see .char.line-active
       in styles.css. Swaps the class on whole line groups instead of
       re-scanning every character. */
    highlightLine(lineIndex) {
        if (!this.lineSpans) return;
        if (this.activeLineIndex != null && this.lineSpans[this.activeLineIndex]) {
            this.lineSpans[this.activeLineIndex].forEach(s => s.classList.remove('line-active'));
        }
        if (lineIndex != null && this.lineSpans[lineIndex]) {
            this.lineSpans[lineIndex].forEach(s => s.classList.add('line-active'));
        }
        this.activeLineIndex = lineIndex;
    }

    displayFileInfo(file) {
        if (this.fileInfo && file) {
            this.fileInfo.innerHTML = '<svg class="icon"><use href="#icon-file"/></svg>';
            const label = document.createElement('span');
            label.textContent = `${file.path || file.name} (${file.language})`;
            this.fileInfo.appendChild(label);
        }
    }

    setTypingFocus(active) {
        if (this.metricsBar) {
            this.metricsBar.classList.toggle('typing-active', active);
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
                            <svg class="icon"><use href="#icon-trash"/></svg> Delete
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

    setFileCountMessage(message) {
        if (this.fileCount) {
            this.fileCount.textContent = message;
        }
    }

    populateCategoryOptions(categories) {
        if (!this.categorySelect) return;
        this.categorySelect.innerHTML = categories
            .map(c => `<option value="${c.value}">${c.label}</option>`)
            .join('');
    }

    setFolderPickerVisible(visible) {
        if (this.fileInputSection) {
            this.fileInputSection.style.display = visible ? '' : 'none';
        }
    }

    updateCharacterDisplay(position, isCorrect) {
        const chars = this.charElements;
        if (chars && position < chars.length) {
            chars[position].classList.remove('current');
            chars[position].classList.add(isCorrect ? 'correct' : 'incorrect');
        }
    }

    setCurrentPosition(position) {
        const chars = this.charElements;
        if (!chars) return;
        chars.forEach(char => char.classList.remove('current'));
        if (position < chars.length) {
            chars[position].classList.add('current');
            this.highlightLine(parseInt(chars[position].dataset.line, 10));
        } else {
            this.highlightLine(null);
        }
    }

    scrollToCurrentChar() {
        // Typewriter-lens effect: keep the current line vertically centered
        // in the typing area at all times, like a magnifying glass moving
        // over smaller surrounding text (see .char.line-active in CSS).
        const current = document.querySelector('.char.current');
        if (!current) return;

        current.scrollIntoView({
            behavior: 'auto',
            block: 'center',
            inline: 'nearest'
        });
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

