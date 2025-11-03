/**
 * CodeDisplayPresenter - Application Service for Code Display
 *
 * Responsibilities (Single Responsibility Principle):
 * - Orchestrate code display rendering
 * - Coordinate syntax highlighting with viewport management
 * - Manage display state transitions
 *
 * This follows the Presenter pattern from MVP architecture
 * and acts as an Application Service in DDD terms
 */

class CodeDisplayPresenter {
  constructor(displayElement, viewportManager, syntaxHighlighter) {
    if (!displayElement || !(displayElement instanceof HTMLElement)) {
      throw new Error('CodeDisplayPresenter requires a valid display element');
    }

    if (!viewportManager) {
      throw new Error('CodeDisplayPresenter requires a ViewportManager instance');
    }

    this._display = displayElement;
    this._viewportManager = viewportManager;
    this._syntaxHighlighter = syntaxHighlighter;
  }

  /**
   * Display code with proper scroll position management
   *
   * @param {string} code - The code content to display
   * @param {string} language - Programming language for syntax highlighting
   * @param {ScrollPositionStrategy} scrollStrategy - Strategy for scroll position
   * @returns {Promise<void>}
   */
  async displayCode(code, language, scrollStrategy) {
    if (typeof code !== 'string') {
      throw new Error('code must be a string');
    }

    if (!scrollStrategy || typeof scrollStrategy.apply !== 'function') {
      throw new Error('scrollStrategy must implement apply() method');
    }

    // Apply syntax highlighting if highlighter is available
    const highlightedCode = this._syntaxHighlighter
      ? this._syntaxHighlighter.highlight(code, language)
      : code;

    // Convert to character spans for typing display
    const html = this._convertToCharacterSpans(highlightedCode);

    // Use ViewportManager to safely update DOM and control scroll
    await this._viewportManager.executeProtectedUpdate(
      () => {
        this._display.innerHTML = html;
      },
      scrollStrategy
    );
  }

  /**
   * Convert code to individual character spans for typing tracking
   * Each character gets a span with data attributes for validation
   *
   * @param {string} highlightedCode - Syntax-highlighted HTML string
   * @returns {string} HTML string with character spans
   * @private
   */
  _convertToCharacterSpans(highlightedCode) {
    let html = '';
    let charIndex = 0;
    let i = 0;

    while (i < highlightedCode.length) {
      // Check for HTML tags from syntax highlighting
      if (highlightedCode[i] === '<' && highlightedCode.substr(i, 6) === '<span ') {
        const tagEnd = highlightedCode.indexOf('>', i);
        const classMatch = highlightedCode.substring(i, tagEnd + 1).match(/class="([^"]+)"/);
        const syntaxClass = classMatch ? classMatch[1] : '';

        const closeTag = '</span>';
        const contentStart = tagEnd + 1;
        const contentEnd = highlightedCode.indexOf(closeTag, contentStart);
        const content = highlightedCode.substring(contentStart, contentEnd);

        // Process each character with syntax class
        for (let j = 0; j < content.length; j++) {
          html += this._createCharSpan(content[j], charIndex, syntaxClass);
          charIndex++;
        }

        i = contentEnd + closeTag.length;
      } else {
        // Regular character without syntax highlighting
        html += this._createCharSpan(highlightedCode[i], charIndex, '');
        charIndex++;
        i++;
      }
    }

    return html;
  }

  /**
   * Create a span element for a single character
   *
   * @param {string} char - The character to wrap
   * @param {number} index - Character index in the code
   * @param {string} syntaxClass - Optional syntax highlighting class
   * @returns {string} HTML string for the character span
   * @private
   */
  _createCharSpan(char, index, syntaxClass) {
    const baseClass = index === 0 ? 'char current' : 'char';
    const classes = syntaxClass ? `${baseClass} ${syntaxClass}` : baseClass;

    if (char === '\n') {
      return `<span class="${classes} newline" data-index="${index}" data-char="\n">↵</span>\n`;
    }

    const visibleChar = char === ' ' ? '␣' : char;
    const escapedChar = this._escapeHtml(char);
    const escapedVisible = this._escapeHtml(visibleChar);

    return `<span class="${classes}" data-index="${index}" data-char="${escapedChar}">${escapedVisible}</span>`;
  }

  /**
   * Escape HTML special characters
   * @param {string} text
   * @returns {string}
   * @private
   */
  _escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Update character display state (correct/incorrect/current)
   * @param {number} position - Character position
   * @param {string} state - 'correct', 'incorrect', or 'current'
   */
  updateCharacterState(position, state) {
    const chars = this._display.querySelectorAll('.char');

    if (!chars[position]) {
      throw new Error(`No character found at position ${position}`);
    }

    const validStates = ['correct', 'incorrect', 'current'];
    if (!validStates.includes(state)) {
      throw new Error(`Invalid state: ${state}. Must be one of: ${validStates.join(', ')}`);
    }

    // Clear previous state
    chars[position].classList.remove('correct', 'incorrect', 'current');

    // Apply new state
    chars[position].classList.add(state);
  }

  /**
   * Get character element at position
   * @param {number} position
   * @returns {HTMLElement|null}
   */
  getCharacterAt(position) {
    const chars = this._display.querySelectorAll('.char');
    return chars[position] || null;
  }

  /**
   * Clear all character states
   */
  clearCharacterStates() {
    const chars = this._display.querySelectorAll('.char');
    chars.forEach(char => {
      char.classList.remove('correct', 'incorrect', 'current');
    });
  }

  /**
   * Display placeholder message
   * @param {string} message
   */
  displayPlaceholder(message) {
    this._display.innerHTML = `<p class="placeholder">${this._escapeHtml(message)}</p>`;
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CodeDisplayPresenter;
}
