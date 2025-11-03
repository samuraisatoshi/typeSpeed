// TypeSpeed Application
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

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadLanguages();
    this.loadSettings();
    this.loadStatistics();
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
    document.getElementById('start-btn').addEventListener('click', () => this.startSession());
    document.getElementById('typing-input').addEventListener('input', (e) => this.handleInput(e));
    document.getElementById('close-results').addEventListener('click', () => this.closeResults());

    // Settings
    document.getElementById('theme-select').addEventListener('change', (e) => this.setTheme(e.target.value));
    document.getElementById('font-size').addEventListener('input', (e) => this.setFontSize(e.target.value));
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

  async scanFolder() {
    const folderPath = document.getElementById('folder-input').value;

    if (!folderPath) {
      alert('Please enter a folder path');
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
        alert(`Found ${result.filesFound} code files!\n\nBy language:\n${
          Object.entries(result.byLanguage).map(([lang, count]) => `${lang}: ${count}`).join('\n')
        }`);

        // Enable start button
        document.getElementById('start-btn').disabled = false;
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert('Failed to scan folder: ' + error.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Scan Folder';
    }
  }

  async startSession() {
    const language = document.getElementById('language-select').value;

    const btn = document.getElementById('start-btn');
    btn.disabled = true;
    btn.textContent = 'Loading...';

    try {
      const response = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: language || undefined,
          userId: this.userId
        })
      });

      const result = await response.json();

      if (response.ok) {
        this.currentSession = result;
        this.codeSnippet = result.formattedCode;
        this.currentPosition = 0;
        this.sessionActive = true;
        this.startTime = Date.now();

        // Display code
        this.displayCode(result.formattedCode);

        // Enable input
        const input = document.getElementById('typing-input');
        input.disabled = false;
        input.value = '';
        input.focus();

        // Start timer
        this.startTimer();

        // Reset metrics
        this.updateMetrics({
          grossWPM: 0,
          netWPM: 0,
          accuracy: 100,
          errors: 0
        });
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert('Failed to start session: ' + error.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Start Typing';
    }
  }

  displayCode(code) {
    const display = document.getElementById('code-display');

    // Convert code to character spans
    const html = code.split('').map((char, index) => {
      const className = index === 0 ? 'char current' : 'char';
      const displayChar = char === '\n' ? '⏎\n' : char;
      return `<span class="${className}" data-index="${index}">${this.escapeHtml(displayChar)}</span>`;
    }).join('');

    display.innerHTML = html;
  }

  async handleInput(event) {
    if (!this.sessionActive || !this.currentSession) return;

    const input = event.target;
    const typedText = input.value;
    const lastChar = typedText[typedText.length - 1];

    if (!lastChar) return;

    try {
      const response = await fetch(`/api/session/${this.currentSession.sessionId}/input`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character: lastChar })
      });

      const result = await response.json();

      if (response.ok) {
        // Update display
        this.updateCharacterDisplay(result.input, result.currentPosition);

        // Update metrics
        this.updateMetrics(result.metrics);

        // Update progress
        document.getElementById('progress-display').textContent = `${Math.round(result.progress)}%`;

        // Check if session is complete
        if (result.state === 'completed') {
          this.completeSession();
        }

        // Move to next character
        this.currentPosition = result.currentPosition;
      }
    } catch (error) {
      console.error('Failed to process input:', error);
    }

    // Clear input for next character
    input.value = '';
  }

  updateCharacterDisplay(input, position) {
    const chars = document.querySelectorAll('.char');

    // Update previous character
    if (position > 0 && chars[position - 1]) {
      chars[position - 1].classList.remove('current');
      chars[position - 1].classList.add(input.isCorrect ? 'correct' : 'incorrect');
    }

    // Update current character
    if (chars[position]) {
      chars[position].classList.add('current');
    }

    // Scroll to keep current position visible
    if (chars[position]) {
      chars[position].scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  updateMetrics(metrics) {
    document.getElementById('wpm-display').textContent = metrics.netWPM || 0;
    document.getElementById('accuracy-display').textContent = `${metrics.accuracy || 100}%`;
  }

  startTimer() {
    this.timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      document.getElementById('time-display').textContent =
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
  }

  async completeSession() {
    this.sessionActive = false;
    clearInterval(this.timer);

    // Disable input
    document.getElementById('typing-input').disabled = true;

    try {
      const response = await fetch(`/api/session/${this.currentSession.sessionId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: this.userId })
      });

      const result = await response.json();

      if (response.ok) {
        this.showResults(result);
      }
    } catch (error) {
      console.error('Failed to complete session:', error);
    }
  }

  showResults(result) {
    const modal = document.getElementById('results-modal');
    const content = document.getElementById('results-content');

    // Clear existing content
    content.innerHTML = '';

    // Create result items safely using DOM methods to prevent XSS
    const createResultItem = (label, value) => {
      const div = document.createElement('div');
      div.className = 'result-item';

      const labelSpan = document.createElement('span');
      labelSpan.className = 'result-label';
      labelSpan.textContent = label;

      const valueSpan = document.createElement('span');
      valueSpan.className = 'result-value';
      valueSpan.textContent = String(value);

      div.appendChild(labelSpan);
      div.appendChild(valueSpan);
      return div;
    };

    // Add result items
    content.appendChild(createResultItem('Net WPM:', result.metrics.netWPM));
    content.appendChild(createResultItem('Gross WPM:', result.metrics.grossWPM));
    content.appendChild(createResultItem('Accuracy:', `${result.metrics.accuracy}%`));
    content.appendChild(createResultItem('Errors:', result.metrics.errors));
    content.appendChild(createResultItem('Time:', `${Math.round(result.metrics.elapsedTime)}s`));

    // Add detailed metrics if available
    if (result.detailedMetrics) {
      content.appendChild(createResultItem('Burst WPM:', result.detailedMetrics.wpm.burst));
      content.appendChild(createResultItem('Difficulty:', result.detailedMetrics.difficulty.score.toFixed(2)));
    }

    modal.classList.add('active');
  }

  closeResults() {
    document.getElementById('results-modal').classList.remove('active');

    // Reset for next session
    document.getElementById('code-display').innerHTML =
      '<p class="placeholder">Click "Start Typing" to begin a new session</p>';
    document.getElementById('typing-input').value = '';

    // Reload statistics
    this.loadStatistics();
  }

  async loadStatistics() {
    try {
      const response = await fetch(`/api/statistics/${this.userId}`);
      const stats = await response.json();

      if (response.ok) {
        // Update stat cards
        document.getElementById('total-sessions').textContent = stats.sessionCount || 0;
        document.getElementById('avg-wpm').textContent = stats.averageMetrics?.netWPM || 0;
        document.getElementById('avg-accuracy').textContent =
          `${stats.averageMetrics?.accuracy || 0}%`;
        document.getElementById('practice-time').textContent =
          `${Math.round((stats.totalPracticeTime || 0) / 60)} min`;

        if (stats.personalBest) {
          document.getElementById('personal-best').textContent =
            `${stats.personalBest.wpm} WPM`;
        }

        document.getElementById('fav-language').textContent =
          stats.mostPracticedLanguage || 'None';

        // Draw progress chart if data exists
        if (stats.progress && stats.progress.length > 0) {
          this.drawProgressChart(stats.progress);
        }
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  }

  drawProgressChart(data) {
    const canvas = document.getElementById('progress-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = 200;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (data.length === 0) return;

    // Calculate scales
    const maxWPM = Math.max(...data.map(d => d.wpm)) + 10;
    const xStep = width / (data.length - 1 || 1);
    const yScale = (height - 40) / maxWPM;

    // Draw grid lines
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    for (let i = 0; i <= 5; i++) {
      const y = height - 20 - (i * (height - 40) / 5);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    // Draw line
    ctx.strokeStyle = '#007acc';
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((point, index) => {
      const x = index * xStep;
      const y = height - 20 - (point.wpm * yScale);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw points
    ctx.fillStyle = '#007acc';
    data.forEach((point, index) => {
      const x = index * xStep;
      const y = height - 20 - (point.wpm * yScale);

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  loadSettings() {
    const theme = localStorage.getItem('typespeed_theme') || 'light';
    const fontSize = localStorage.getItem('typespeed_font_size') || '16';

    document.getElementById('theme-select').value = theme;
    document.getElementById('font-size').value = fontSize;
    document.getElementById('font-size-value').textContent = `${fontSize}px`;

    this.setTheme(theme);
    this.setFontSize(fontSize);
  }

  setTheme(theme) {
    document.body.className = theme === 'dark' ? 'dark' : '';
    localStorage.setItem('typespeed_theme', theme);
  }

  setFontSize(size) {
    document.documentElement.style.setProperty('--code-font-size', `${size}px`);
    document.getElementById('font-size-value').textContent = `${size}px`;
    document.querySelector('.code-display').style.fontSize = `${size}px`;
    localStorage.setItem('typespeed_font_size', size);
  }

  resetStatistics() {
    if (confirm('Are you sure you want to reset all statistics?')) {
      // Note: This would need a backend endpoint to actually clear stats
      localStorage.removeItem('typespeed_user_id');
      this.userId = this.getUserId();
      this.loadStatistics();
      alert('Statistics reset!');
    }
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
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new TypeSpeedApp();
});