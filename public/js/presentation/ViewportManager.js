/**
 * ViewportManager - Domain Service for viewport state management
 *
 * Responsibilities (Single Responsibility Principle):
 * - Manage scroll position state
 * - Coordinate scroll strategy execution
 * - Prevent unwanted scroll behavior during DOM updates
 *
 * This class follows Domain-Driven Design by encapsulating
 * the business logic of viewport management as a domain concern
 */

class ViewportManager {
  constructor(container) {
    if (!container || !(container instanceof HTMLElement)) {
      throw new Error('ViewportManager requires a valid HTMLElement container');
    }

    this._container = container;
    this._scrollLocked = false;
    this._lockHandlers = [];
  }

  /**
   * Lock scroll position during DOM manipulation
   * Prevents browser from auto-scrolling during innerHTML updates
   *
   * @returns {Function} Unlock function to restore normal scrolling
   */
  lockScroll() {
    if (this._scrollLocked) {
      throw new Error('Scroll is already locked. Call unlock before locking again.');
    }

    this._scrollLocked = true;

    // Save current scroll position
    const savedTop = this._container.scrollTop;
    const savedLeft = this._container.scrollLeft;

    // Create scroll prevention handler
    const preventScroll = (e) => {
      if (this._scrollLocked) {
        e.preventDefault();
        e.stopPropagation();
        this._container.scrollTop = savedTop;
        this._container.scrollLeft = savedLeft;
        return false;
      }
    };

    // Lock scroll with multiple event types
    this._container.addEventListener('scroll', preventScroll, { passive: false });
    this._container.addEventListener('wheel', preventScroll, { passive: false });
    this._container.addEventListener('touchmove', preventScroll, { passive: false });

    // Disable overflow temporarily
    const originalOverflow = this._container.style.overflow;
    this._container.style.overflow = 'hidden';

    // Store handlers for cleanup
    this._lockHandlers.push(preventScroll);

    // Return unlock function
    return () => {
      this._scrollLocked = false;
      this._container.style.overflow = originalOverflow;
      this._container.removeEventListener('scroll', preventScroll);
      this._container.removeEventListener('wheel', preventScroll);
      this._container.removeEventListener('touchmove', preventScroll);
      this._lockHandlers = [];
    };
  }

  /**
   * Execute a DOM update with protected scroll position
   * Uses Template Method pattern for safe DOM manipulation
   *
   * @param {Function} updateFn - Function that performs DOM update
   * @param {ScrollPositionStrategy} strategy - Strategy for final scroll position
   * @returns {Promise<void>}
   */
  async executeProtectedUpdate(updateFn, strategy) {
    if (typeof updateFn !== 'function') {
      throw new Error('updateFn must be a function');
    }

    if (!strategy || typeof strategy.apply !== 'function') {
      throw new Error('strategy must implement apply() method');
    }

    // Lock scroll during update
    const unlock = this.lockScroll();

    try {
      // Perform DOM update
      await updateFn();

      // Force synchronous reflow before unlocking
      void this._container.offsetHeight;

      // Unlock scroll
      unlock();

      // Apply strategy immediately after unlocking
      strategy.apply(this._container);

      // Force another reflow to ensure scroll position is applied
      void this._container.offsetHeight;

    } catch (error) {
      // Ensure unlock even on error
      unlock();
      throw error;
    }
  }

  /**
   * Apply a scroll strategy directly
   * @param {ScrollPositionStrategy} strategy
   */
  applyStrategy(strategy) {
    if (!strategy || typeof strategy.apply !== 'function') {
      throw new Error('strategy must implement apply() method');
    }

    strategy.apply(this._container);
  }

  /**
   * Get current scroll position as a PreserveScrollStrategy
   * @returns {PreserveScrollStrategy}
   */
  captureCurrentPosition() {
    // Note: This requires PreserveScrollStrategy to be available
    // In a real implementation, this would use dependency injection
    return {
      apply: (container) => {
        container.scrollTop = this._container.scrollTop;
        container.scrollLeft = this._container.scrollLeft;
      }
    };
  }

  /**
   * Check if scroll is currently locked
   * @returns {boolean}
   */
  isScrollLocked() {
    return this._scrollLocked;
  }

  /**
   * Get the managed container element
   * @returns {HTMLElement}
   */
  getContainer() {
    return this._container;
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ViewportManager;
}
