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

