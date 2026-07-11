// Bootstrap: wires up the splash screen, app instance and global
// window-level handlers referenced directly from index.html markup
// (onclick attributes). Not a domain/application class — just the
// composition root that starts TypingApp once the DOM is ready.

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

let appInstance = null;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        showSplashIfNeeded();
        appInstance = new TypingApp();
    });
} else {
    showSplashIfNeeded();
    appInstance = new TypingApp();
}

window.closeSplash = closeSplash;

function closeResultsModal() {
    const modal = document.getElementById('resultsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function newSnippetFromModal() {
    closeResultsModal();
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.click();
    }
}

window.closeResultsModal = closeResultsModal;
window.newSnippetFromModal = newSnippetFromModal;

function deleteSession(sessionId) {
    if (confirm('Are you sure you want to delete this session?')) {
        if (appInstance && appInstance.statistics) {
            appInstance.statistics.deleteSession(sessionId);
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

window.deleteSession = deleteSession;
window.clearAllSessions = clearAllSessions;

