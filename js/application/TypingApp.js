// Application Layer - Main App
class TypingApp {
    constructor() {
        this.codeRepository = new CodeFileRepository();
        this.statistics = new Statistics();
        this.snippetSelector = new CodeSnippetSelector();
        this.ui = new UIController();
        this.inputHandler = new InputHandler();
        this.categoryProvider = new PracticeCategoryProvider(DEFAULT_CODE_FILES, PRACTICE_TEXTS, TYPING_DRILLS);
        this.bibleService = new BiblePassageService(new RandomBiblePassageSelector(BIBLE_BOOKS_META));
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

        this.ui.populateCategoryOptions(this.categoryProvider.getCategories());
        this.ui.categorySelect.addEventListener('change', (e) => this.handleCategoryChange(e.target.value));
        this.handleCategoryChange('code-default');

        this.ui.updateStatistics(this.statistics);
    }

    handleCategoryChange(categoryValue) {
        this.activeCategory = categoryValue;
        const showPicker = this.categoryProvider.requiresFolderPicker(categoryValue);
        this.ui.setFolderPickerVisible(showPicker);

        if (showPicker) {
            this.ui.updateFileCount(this.codeRepository.getFileCount());
            this.ui.setStartButtonEnabled(this.codeRepository.hasFiles());
            return;
        }

        if (this.categoryProvider.isLiveFetch(categoryValue)) {
            this.ui.setFileCountMessage('Passagem aleatória a cada sessão (requer internet)');
            this.ui.setStartButtonEnabled(true);
            return;
        }

        const dataset = this.categoryProvider.getDataset(categoryValue);
        const count = this.codeRepository.loadFromDataset(dataset);
        this.ui.updateFileCount(count);
        this.ui.setStartButtonEnabled(count > 0);
    }

    async handleFileSelect(event) {
        const count = await this.codeRepository.loadFromFileList(event.target.files);
        this.ui.updateFileCount(count);
        this.ui.setStartButtonEnabled(count > 0);

        if (count === 0) {
            alert('No valid code files found in the selected folder. Please select a folder containing source code files.');
        }
    }

    async startSession() {
        if (this.categoryProvider.isLiveFetch(this.activeCategory)) {
            this.ui.setStartButtonEnabled(false);
            this.ui.setFileCountMessage('Buscando passagem…');
            try {
                const passage = await this.bibleService.fetchRandomPassage(this.activeCategory);
                this.codeRepository.loadFromDataset([passage]);
            } catch (error) {
                this.ui.setFileCountMessage('Passagem aleatória a cada sessão (requer internet)');
                this.ui.setStartButtonEnabled(true);
                alert(`Não foi possível buscar uma passagem bíblica agora.\n\n${error.message}`);
                return;
            }
            this.ui.setFileCountMessage('Passagem aleatória a cada sessão (requer internet)');
            this.ui.setStartButtonEnabled(true);
        }

        if (!this.codeRepository.hasFiles()) {
            alert('Please select a folder containing code files first');
            return;
        }

        const file = this.codeRepository.getRandomFile();
        const maxLines = parseInt(document.getElementById('maxLines')?.value) || 50;
        const snippet = this.snippetSelector.selectSnippet(file.content, maxLines);

        this.currentSession = new TypingSession(snippet, file);

        this.ui.displayCode(snippet, file.language === 'Text');
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
                this.ui.setTypingFocus(true);
            } else {
                return;
            }
        }

        this.skipIndentation();

        const chars = this.ui.charElements;
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
            // Checked on every keystroke, but scrollToCurrentChar() only actually
            // scrolls when the cursor is outside the viewport (cheap bounding-rect
            // check) and does so instantly (behavior: 'auto'), so this no longer
            // needs to be throttled the way a smooth-scroll animation would.
            this.ui.scrollToCurrentChar();
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

        const chars = this.ui.charElements;
        while (this.currentSession.currentPosition > 0 &&
               chars[this.currentSession.currentPosition].classList.contains('indent-skip')) {
            this.currentSession.moveToPreviousPosition();
        }

        const currentChar = chars[this.currentSession.currentPosition];
        if (currentChar && !currentChar.classList.contains('indent-skip')) {
            currentChar.classList.remove('correct', 'incorrect');
        }
        this.ui.setCurrentPosition(this.currentSession.currentPosition);
        this.ui.scrollToCurrentChar();

        const metrics = this.currentSession.getMetrics();
        metrics.progress = Math.floor((this.currentSession.currentPosition / chars.length) * 100);
        this.ui.updateMetrics(metrics);
    }

    skipIndentation() {
        if (!this.currentSession) return;

        const chars = this.ui.charElements;
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
        }, 1000);
    }

    completeSession() {
        if (!this.currentSession) return;
        this.ui.setTypingFocus(false);

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

