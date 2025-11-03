/**
 * ScrollPositionStrategy - Strategy Interface for scroll position management
 *
 * Following Strategy Pattern and Interface Segregation Principle
 * Each concrete strategy handles a specific scroll positioning scenario
 */

class ScrollPositionStrategy {
  /**
   * Apply scroll position to container
   * @param {HTMLElement} container - The scrollable container
   * @throws {Error} If method not implemented
   */
  apply(container) {
    throw new Error('ScrollPositionStrategy.apply() must be implemented');
  }
}

/**
 * TopScrollStrategy - Ensures content starts at the top
 * Used when starting a new typing session
 */
class TopScrollStrategy extends ScrollPositionStrategy {
  apply(container) {
    if (!container) {
      throw new Error('TopScrollStrategy requires a valid container element');
    }

    // Force immediate scroll to top - synchronous operation
    container.scrollTop = 0;
    container.scrollLeft = 0;

    // Ensure no pending scroll events
    this._preventPendingScrolls(container);
  }

  _preventPendingScrolls(container) {
    // Cancel any pending scroll animations
    if (container.style.scrollBehavior) {
      const originalBehavior = container.style.scrollBehavior;
      container.style.scrollBehavior = 'auto';

      // Force reflow to ensure scroll takes effect
      void container.offsetHeight;

      container.style.scrollBehavior = originalBehavior;
    }
  }
}

/**
 * PreserveScrollStrategy - Maintains current scroll position
 * Used when updating content without disrupting user view
 */
class PreserveScrollStrategy extends ScrollPositionStrategy {
  constructor(scrollTop, scrollLeft) {
    super();
    this._scrollTop = scrollTop;
    this._scrollLeft = scrollLeft;
  }

  apply(container) {
    if (!container) {
      throw new Error('PreserveScrollStrategy requires a valid container element');
    }

    container.scrollTop = this._scrollTop;
    container.scrollLeft = this._scrollLeft;
  }
}

/**
 * SmoothScrollToElementStrategy - Smoothly scrolls to keep element visible
 * Used during typing to keep current character in view
 */
class SmoothScrollToElementStrategy extends ScrollPositionStrategy {
  constructor(element, options = {}) {
    super();
    this._element = element;
    this._buffer = options.buffer || 100;
    this._minPositionBeforeScroll = options.minPosition || 10;
  }

  apply(container) {
    if (!container || !this._element) {
      throw new Error('SmoothScrollToElementStrategy requires valid container and element');
    }

    const containerRect = container.getBoundingClientRect();
    const elementRect = this._element.getBoundingClientRect();

    const elementTop = elementRect.top - containerRect.top;
    const elementBottom = elementRect.bottom - containerRect.top;
    const containerHeight = container.clientHeight;

    // Only scroll if element is near edges
    if (elementBottom > containerHeight - this._buffer) {
      const scrollBy = elementBottom - (containerHeight - this._buffer);
      container.scrollTop += scrollBy;
    } else if (elementTop < this._buffer) {
      const scrollBy = elementTop - this._buffer;
      container.scrollTop += scrollBy;
    }
  }
}

// Export strategies
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ScrollPositionStrategy,
    TopScrollStrategy,
    PreserveScrollStrategy,
    SmoothScrollToElementStrategy
  };
}
