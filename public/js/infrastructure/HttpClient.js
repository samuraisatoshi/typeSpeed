/**
 * HttpClient - Infrastructure Service
 *
 * Responsibilities (Single Responsibility Principle):
 * - Provide abstraction over fetch API
 * - Handle common HTTP request/response patterns
 * - Centralize HTTP error handling
 * - Support dependency injection and testing
 *
 * This is an Infrastructure Service in DDD terms, providing
 * a technical capability (HTTP communication) to the application layer.
 *
 * Design Goals:
 * - Follow Dependency Inversion by providing an interface for HTTP operations
 * - Encapsulate fetch API details
 * - Make testing easier by allowing mock implementations
 * - Provide consistent error handling
 */

class HttpClient {
  constructor(baseUrl = '', defaultHeaders = {}) {
    this._baseUrl = baseUrl;
    this._defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders
    };
  }

  /**
   * Perform GET request
   * @param {string} url - Request URL
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Response>} Fetch response
   */
  async get(url, options = {}) {
    return this._request(url, {
      method: 'GET',
      ...options
    });
  }

  /**
   * Perform POST request
   * @param {string} url - Request URL
   * @param {Object} body - Request body (will be JSON stringified)
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Response>} Fetch response
   */
  async post(url, body = null, options = {}) {
    return this._request(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : null,
      ...options
    });
  }

  /**
   * Perform PUT request
   * @param {string} url - Request URL
   * @param {Object} body - Request body (will be JSON stringified)
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Response>} Fetch response
   */
  async put(url, body = null, options = {}) {
    return this._request(url, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : null,
      ...options
    });
  }

  /**
   * Perform DELETE request
   * @param {string} url - Request URL
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Response>} Fetch response
   */
  async delete(url, options = {}) {
    return this._request(url, {
      method: 'DELETE',
      ...options
    });
  }

  /**
   * Internal request method
   * @param {string} url - Request URL
   * @param {Object} options - Fetch options
   * @returns {Promise<Response>} Fetch response
   * @private
   */
  async _request(url, options = {}) {
    const fullUrl = this._buildUrl(url);

    const config = {
      ...options,
      headers: {
        ...this._defaultHeaders,
        ...(options.headers || {})
      }
    };

    try {
      const response = await fetch(fullUrl, config);
      return response;
    } catch (error) {
      // Wrap network errors
      throw new HttpClientError(
        `Network request failed: ${error.message}`,
        'NETWORK_ERROR',
        error
      );
    }
  }

  /**
   * Build full URL from base URL and path
   * @param {string} url - URL path
   * @returns {string} Full URL
   * @private
   */
  _buildUrl(url) {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    const base = this._baseUrl.endsWith('/') ? this._baseUrl.slice(0, -1) : this._baseUrl;
    const path = url.startsWith('/') ? url : `/${url}`;
    return base + path;
  }

  /**
   * Set a default header
   * @param {string} name - Header name
   * @param {string} value - Header value
   */
  setDefaultHeader(name, value) {
    this._defaultHeaders[name] = value;
  }

  /**
   * Remove a default header
   * @param {string} name - Header name
   */
  removeDefaultHeader(name) {
    delete this._defaultHeaders[name];
  }
}

/**
 * HttpClientError - Specialized error for HTTP operations
 */
class HttpClientError extends Error {
  constructor(message, code, originalError = null) {
    super(message);
    this.name = 'HttpClientError';
    this.code = code;
    this.originalError = originalError;
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HttpClient, HttpClientError };
}
