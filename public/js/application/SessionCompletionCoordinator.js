/**
 * SessionCompletionCoordinator - Application Service
 *
 * Responsibilities (Single Responsibility Principle):
 * - Coordinate session completion workflow
 * - Sequence async operations to prevent race conditions
 * - Handle completion errors with proper user feedback
 * - Transform server responses into domain-friendly formats
 *
 * This is an Application Service in DDD terms that orchestrates
 * the completion of a typing session following proper async flow control.
 *
 * Design Goals:
 * - Eliminate race conditions by enforcing sequential async operations
 * - Provide clear error handling with user-friendly messages
 * - Follow the Dependency Inversion Principle by depending on abstractions
 * - Maintain single responsibility for session completion coordination
 */

class SessionCompletionCoordinator {
  /**
   * @param {Object} httpClient - HTTP client for API calls (abstraction)
   * @param {FeedbackPresenter} feedbackPresenter - Presenter for user feedback
   */
  constructor(httpClient, feedbackPresenter) {
    if (!httpClient || typeof httpClient.post !== 'function') {
      throw new Error('SessionCompletionCoordinator requires an HTTP client with post() method');
    }

    if (!feedbackPresenter) {
      throw new Error('SessionCompletionCoordinator requires a FeedbackPresenter');
    }

    this._httpClient = httpClient;
    this._feedbackPresenter = feedbackPresenter;
  }

  /**
   * Complete a typing session with proper async sequencing
   *
   * This method ensures:
   * 1. The session state is NOT changed until completion is confirmed
   * 2. Network request completes before any UI state changes
   * 3. User receives feedback regardless of success or failure
   * 4. All async operations are properly sequenced
   *
   * @param {string} sessionId - The session identifier
   * @param {string} userId - The user identifier
   * @returns {Promise<SessionCompletionResult>} Completion result
   * @throws {SessionCompletionError} If completion fails
   */
  async completeSession(sessionId, userId) {
    console.log('[Coordinator] Starting completion for session:', sessionId, 'user:', userId);

    // Input validation
    if (!sessionId || typeof sessionId !== 'string') {
      throw new Error('sessionId is required and must be a string');
    }

    if (!userId || typeof userId !== 'string') {
      throw new Error('userId is required and must be a string');
    }

    try {
      // Step 1: Send completion request to server (blocking operation)
      // CRITICAL: This must complete BEFORE any state changes
      console.log('[Coordinator] Sending POST to:', `/api/session/${sessionId}/complete`);
      const response = await this._httpClient.post(
        `/api/session/${sessionId}/complete`,
        { userId }
      );
      console.log('[Coordinator] Response received:', response.status, response.ok);

      // Step 2: Validate response
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[Coordinator] Server error:', errorData);
        console.error('[Coordinator] Error details:', errorData.details);
        const errorMessage = errorData.details || errorData.error || 'Failed to complete session';
        throw new SessionCompletionError(
          errorMessage,
          'SERVER_ERROR',
          response.status
        );
      }

      // Step 3: Parse response data
      const resultData = await response.json();

      // Step 4: Create immutable result value object
      const result = SessionCompletionResult.fromServerResponse(resultData);

      // Step 5: Return result for caller to handle state changes
      // Note: State changes should happen AFTER this method returns successfully
      return result;

    } catch (error) {
      // Handle different error types
      if (error instanceof SessionCompletionError) {
        // Re-throw domain errors
        throw error;
      }

      // Network or other errors
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        throw new SessionCompletionError(
          'Network error: Could not connect to server',
          'NETWORK_ERROR',
          0,
          error
        );
      }

      // Unknown errors
      throw new SessionCompletionError(
        `Session completion failed: ${error.message}`,
        'UNKNOWN_ERROR',
        0,
        error
      );
    }
  }

  /**
   * Complete session with integrated feedback
   *
   * This is a convenience method that combines completion with feedback display.
   * Use this when you want automatic error handling with user notifications.
   *
   * @param {string} sessionId - The session identifier
   * @param {string} userId - The user identifier
   * @returns {Promise<SessionCompletionResult|null>} Result or null on error
   */
  async completeSessionWithFeedback(sessionId, userId) {
    try {
      const result = await this.completeSession(sessionId, userId);
      return result;

    } catch (error) {
      // Use feedback presenter to show error to user
      if (error instanceof SessionCompletionError) {
        this._feedbackPresenter.showError(error.getUserMessage());
      } else {
        this._feedbackPresenter.showError('An unexpected error occurred while completing the session');
      }

      // Log technical details for debugging
      console.error('Session completion error:', error);

      // Return null to indicate failure
      return null;
    }
  }

  /**
   * Validate that session is ready for completion
   *
   * @param {Object} session - The session object to validate
   * @throws {Error} If session is not valid for completion
   */
  validateSessionForCompletion(session) {
    if (!session) {
      throw new Error('Cannot complete: session is null or undefined');
    }

    if (!session.sessionId) {
      throw new Error('Cannot complete: session has no sessionId');
    }

    if (session.state === 'completed') {
      throw new Error('Cannot complete: session is already completed');
    }
  }
}

/**
 * SessionCompletionError - Domain Exception
 *
 * Specialized error for session completion failures that provides
 * both technical details and user-friendly messages.
 */
class SessionCompletionError extends Error {
  constructor(message, code, statusCode, originalError = null) {
    super(message);
    this.name = 'SessionCompletionError';
    this.code = code;
    this.statusCode = statusCode;
    this.originalError = originalError;
  }

  /**
   * Get a user-friendly error message
   * @returns {string}
   */
  getUserMessage() {
    switch (this.code) {
      case 'NETWORK_ERROR':
        return 'Could not connect to the server. Please check your internet connection and try again.';
      case 'SERVER_ERROR':
        return this.statusCode === 404
          ? 'Session not found. It may have expired.'
          : 'The server encountered an error while saving your results. Please try again.';
      case 'TIMEOUT_ERROR':
        return 'The request took too long. Please try again.';
      default:
        return 'An unexpected error occurred. Your progress may not have been saved.';
    }
  }

  /**
   * Check if error is recoverable
   * @returns {boolean}
   */
  isRecoverable() {
    return this.code === 'NETWORK_ERROR' || this.code === 'TIMEOUT_ERROR';
  }
}

/**
 * SessionCompletionResult - Value Object
 *
 * Immutable result of a completed typing session.
 * Encapsulates all metrics and metadata from completion.
 */
class SessionCompletionResult {
  constructor(duration, metrics, detailedMetrics) {
    // Immutable properties
    Object.defineProperty(this, 'duration', {
      value: duration,
      writable: false,
      enumerable: true
    });

    Object.defineProperty(this, 'metrics', {
      value: Object.freeze({ ...metrics }),
      writable: false,
      enumerable: true
    });

    Object.defineProperty(this, 'detailedMetrics', {
      value: detailedMetrics ? Object.freeze({ ...detailedMetrics }) : null,
      writable: false,
      enumerable: true
    });

    // Freeze the instance
    Object.freeze(this);
  }

  /**
   * Create from server response
   * @param {Object} serverResponse - Response from completion API
   * @returns {SessionCompletionResult}
   */
  static fromServerResponse(serverResponse) {
    if (!serverResponse || !serverResponse.metrics) {
      throw new Error('Invalid server response: missing metrics');
    }

    return new SessionCompletionResult(
      serverResponse.duration || 0,
      serverResponse.metrics,
      serverResponse.detailedMetrics
    );
  }

  /**
   * Get formatted duration string
   * @returns {string} Duration in MM:SS format
   */
  getFormattedDuration() {
    const seconds = Math.floor(this.duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Get rounded WPM values
   * @returns {Object} { netWPM, grossWPM }
   */
  getRoundedWPM() {
    return {
      netWPM: Math.round(this.metrics.netWPM || 0),
      grossWPM: Math.round(this.metrics.grossWPM || 0)
    };
  }

  /**
   * Get formatted accuracy
   * @returns {string} Accuracy with one decimal place
   */
  getFormattedAccuracy() {
    return (this.metrics.accuracy || 0).toFixed(1);
  }

  /**
   * Check if this was a successful session
   * @returns {boolean}
   */
  isSuccessful() {
    return this.metrics.accuracy >= 80 && this.metrics.netWPM > 0;
  }

  /**
   * Value object equality
   * @param {SessionCompletionResult} other
   * @returns {boolean}
   */
  equals(other) {
    if (!(other instanceof SessionCompletionResult)) {
      return false;
    }

    return this.duration === other.duration &&
           JSON.stringify(this.metrics) === JSON.stringify(other.metrics);
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SessionCompletionCoordinator,
    SessionCompletionError,
    SessionCompletionResult
  };
}
