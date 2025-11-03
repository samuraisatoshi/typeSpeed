/**
 * TypingSession Domain Model
 * Represents a code typing practice session
 * Single Responsibility: Manage typing session state and rules
 */
export class TypingSession {
    constructor(codeSnippet, file) {
        this.id = Date.now();
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
        return (endTime - this.startTime) / 1000; // in seconds
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
        const words = this.totalChars / 5; // Standard WPM calculation
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