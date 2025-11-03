/**
 * FeedbackPresenter - Presentation Layer Service
 *
 * Responsibilities (Single Responsibility Principle):
 * - Present user feedback messages (errors, success, warnings, info)
 * - Manage toast notifications lifecycle
 * - Ensure consistent feedback styling and behavior
 *
 * This follows the Presenter pattern from MVP architecture and acts
 * as a Presentation Service in DDD terms, isolating UI concerns from domain logic.
 *
 * Design Goals:
 * - Provide a clean abstraction for user feedback
 * - Prevent direct DOM manipulation in application/domain services
 * - Support dependency injection for testing
 * - Follow Interface Segregation with focused methods
 */

class FeedbackPresenter {
  constructor(toastFactory = null) {
    this._toastFactory = toastFactory || new ToastNotificationFactory();
    this._ensureStylesPresent();
  }

  /**
   * Show error message to user
   * @param {string} message - Error message
   * @param {number} duration - Display duration in milliseconds
   */
  showError(message, duration = 5000) {
    this._show(message, 'error', duration);
  }

  /**
   * Show success message to user
   * @param {string} message - Success message
   * @param {number} duration - Display duration in milliseconds
   */
  showSuccess(message, duration = 3000) {
    this._show(message, 'success', duration);
  }

  /**
   * Show warning message to user
   * @param {string} message - Warning message
   * @param {number} duration - Display duration in milliseconds
   */
  showWarning(message, duration = 4000) {
    this._show(message, 'warning', duration);
  }

  /**
   * Show informational message to user
   * @param {string} message - Info message
   * @param {number} duration - Display duration in milliseconds
   */
  showInfo(message, duration = 3000) {
    this._show(message, 'info', duration);
  }

  /**
   * Show loading indicator with message
   * @param {string} message - Loading message
   * @returns {Function} Function to dismiss the loading indicator
   */
  showLoading(message) {
    const toast = this._toastFactory.create(message, 'info');
    toast.classList.add('loading');
    document.body.appendChild(toast);

    // Return dismiss function
    return () => {
      this._dismissToast(toast);
    };
  }

  /**
   * Internal method to show toast
   * @param {string} message
   * @param {string} type
   * @param {number} duration
   * @private
   */
  _show(message, type, duration) {
    if (!message || typeof message !== 'string') {
      throw new Error('Message must be a non-empty string');
    }

    const validTypes = ['error', 'success', 'warning', 'info'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid type: ${type}. Must be one of: ${validTypes.join(', ')}`);
    }

    const toast = this._toastFactory.create(message, type);
    document.body.appendChild(toast);

    // Auto-dismiss after duration
    setTimeout(() => {
      this._dismissToast(toast);
    }, duration);
  }

  /**
   * Dismiss a toast with animation
   * @param {HTMLElement} toast
   * @private
   */
  _dismissToast(toast) {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  /**
   * Ensure toast styles are present in document
   * @private
   */
  _ensureStylesPresent() {
    if (document.getElementById('feedback-presenter-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'feedback-presenter-styles';
    style.textContent = `
      .feedback-toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 4px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .feedback-toast.error { background: #f44336; }
      .feedback-toast.success { background: #4caf50; }
      .feedback-toast.warning { background: #ff9800; }
      .feedback-toast.info { background: #2196f3; }
      .feedback-toast.loading {
        background: #2196f3;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .feedback-toast.loading::before {
        content: '';
        width: 16px;
        height: 16px;
        border: 2px solid white;
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * ToastNotificationFactory - Factory for creating toast elements
 *
 * Follows the Factory pattern to encapsulate toast element creation.
 * This allows for easy testing and customization.
 */
class ToastNotificationFactory {
  /**
   * Create a toast notification element
   * @param {string} message - Message to display
   * @param {string} type - Toast type (error, success, warning, info)
   * @returns {HTMLElement} Toast element
   */
  create(message, type) {
    const toast = document.createElement('div');
    toast.className = `feedback-toast ${type}`;
    toast.textContent = this._sanitizeMessage(message);
    return toast;
  }

  /**
   * Sanitize message to prevent XSS
   * @param {string} message
   * @returns {string}
   * @private
   */
  _sanitizeMessage(message) {
    // Create a text node to safely encode the message
    const div = document.createElement('div');
    div.textContent = message;
    return div.innerHTML;
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FeedbackPresenter, ToastNotificationFactory };
}
