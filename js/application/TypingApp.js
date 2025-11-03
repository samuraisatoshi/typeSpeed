/**
 * TypingApp Application Service
 * Orchestrates the typing practice application
 * Single Responsibility: Coordinate domain models and UI
 */
import { TypingSession } from '../domain/TypingSession.js';
import { CodeFileRepository } from '../domain/CodeFileRepository.js';
import { Statistics } from '../domain/Statistics.js';
import { CodeSnippetSelector } from '../domain/CodeSnippetSelector.js';
import { UIController } from './UIController.js';
import { InputHandler } from '../infrastructure/InputHandler.js';

export class TypingApp {
    constructor() {
        // Domain models
        this.codeRepository = new CodeFileRepository();
        this.statistics = new Statistics();
        this.snippetSelector = new CodeSnippetSelector();

        // Application services
        this.ui = new UIController();
        this.inputHandler = new InputHandler();

        // Session state
        this.currentSession = null;
        this.timerInterval = null;

        this.initialize();
    }

    initialize() {
        // Wire up event listeners
        this.ui.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.ui.startBtn.addEventListener('click', () => this.startSession());
        this.ui.resetBtn.addEventListener('click', () => this.resetSession());

        // Setup input handlers
        this.inputHandler.onCharacter = (char) => this.handleCharacterInput(char);
        this.inputHandler.onBackspace = () => this.handleBackspace();
        this.inputHandler.onEnter = () => this.handleCharacterInput('\n');

        // Connect input handler to UI
        this.inputHandler.attachTo(this.ui.hiddenInput);

        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.ui.switchView(e.target.dataset.view);
                if (e.target.dataset.view === 'statistics') {
                    this.ui.updateStatistics(this.statistics);
                }
            });
        });

        // Keep focus during typing
        document.addEventListener('click', () => {
            if (this.currentSession && this.currentSession.isActive) {
                this.ui.focusInput();
            }
        });

        // Load initial statistics
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

        // Get random file and snippet
        const file = this.codeRepository.getRandomFile();
        const maxLines = parseInt(document.getElementById('maxLines')?.value) || 50;
        const snippet = this.snippetSelector.selectSnippet(file.content, maxLines);

        // Create new session
        this.currentSession = new TypingSession(snippet, file);

        // Update UI
        this.ui.displayCode(snippet);
        this.ui.displayFileInfo(file);
        this.ui.setStartButtonText('New Snippet');
        this.ui.setResetButtonVisible(true);
        this.ui.focusInput();

        // Reset metrics display
        this.ui.updateMetrics({
            netWPM: 0,
            accuracy: 100,
            progress: 0
        });
        this.ui.updateTimer(0);

        // Skip initial indentation
        this.skipIndentation();
    }

    resetSession() {
        if (this.currentSession) {
            this.currentSession.end();
        }
        this.currentSession = null;

        // Stop timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        // Reset UI
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

        // Skip indentation automatically
        this.skipIndentation();

        const chars = document.querySelectorAll('.char');
        if (this.currentSession.currentPosition >= chars.length) {
            return;
        }

        const currentChar = chars[this.currentSession.currentPosition];
        const expectedChar = currentChar.dataset.char;

        // Process input in domain model
        const isCorrect = this.currentSession.processInput(typedChar, expectedChar);

        // Update UI
        this.ui.updateCharacterDisplay(this.currentSession.currentPosition, isCorrect);

        // Move to next position
        this.currentSession.moveToNextPosition();
        this.skipIndentation();

        // Update current position indicator
        if (this.currentSession.currentPosition < chars.length) {
            this.ui.setCurrentPosition(this.currentSession.currentPosition);
            this.ui.scrollToCurrentChar();
        }

        // Update metrics
        const metrics = this.currentSession.getMetrics();
        metrics.progress = Math.floor((this.currentSession.currentPosition / chars.length) * 100);
        this.ui.updateMetrics(metrics);

        // Check if complete
        if (this.currentSession.isComplete()) {
            this.completeSession();
        }
    }

    handleBackspace() {
        if (!this.currentSession || this.currentSession.currentPosition === 0) {
            return;
        }

        // Move back
        this.currentSession.moveToPreviousPosition();

        // Skip back over indentation
        const chars = document.querySelectorAll('.char');
        while (this.currentSession.currentPosition > 0 &&
               chars[this.currentSession.currentPosition].classList.contains('indent-skip')) {
            this.currentSession.moveToPreviousPosition();
        }

        // Reset character state
        const currentChar = chars[this.currentSession.currentPosition];
        if (currentChar && !currentChar.classList.contains('indent-skip')) {
            currentChar.classList.remove('correct', 'incorrect', 'current');
            currentChar.classList.add('current');
        }

        // Update metrics
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

        // End session
        this.currentSession.end();
        const metrics = this.currentSession.getMetrics();

        // Stop timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        // Save to statistics
        this.statistics.addSession(this.currentSession, metrics);

        // Show results
        this.ui.showResults(metrics);

        // Reset for next session
        this.currentSession = null;
        this.ui.setStartButtonText('Start Typing');
        this.ui.setResetButtonVisible(false);
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new TypingApp());
} else {
    new TypingApp();
}