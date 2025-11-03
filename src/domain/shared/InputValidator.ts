/**
 * Service for validating user inputs
 * Provides domain-level input validation to prevent injection attacks
 */
export class InputValidator {
  /**
   * Validates that a string is a single character
   * @param input - The input to validate
   * @throws Error if input is not a single character
   */
  public static validateSingleCharacter(input: unknown): string {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string');
    }

    if (input.length !== 1) {
      throw new Error('Input must be exactly one character');
    }

    return input;
  }

  /**
   * Validates that a string is not empty
   * @param input - The input to validate
   * @param fieldName - Name of the field for error messages
   * @throws Error if input is empty or not a string
   */
  public static validateNonEmptyString(input: unknown, fieldName: string): string {
    if (typeof input !== 'string') {
      throw new Error(`${fieldName} must be a string`);
    }

    if (input.trim().length === 0) {
      throw new Error(`${fieldName} cannot be empty`);
    }

    return input.trim();
  }

  /**
   * Validates that a number is within a specified range
   * @param input - The input to validate
   * @param fieldName - Name of the field for error messages
   * @param min - Minimum allowed value (inclusive)
   * @param max - Maximum allowed value (inclusive)
   * @throws Error if input is not a valid number or outside range
   */
  public static validateNumberInRange(
    input: unknown,
    fieldName: string,
    min: number,
    max: number
  ): number {
    if (typeof input !== 'number' || isNaN(input)) {
      throw new Error(`${fieldName} must be a valid number`);
    }

    if (input < min || input > max) {
      throw new Error(`${fieldName} must be between ${min} and ${max}`);
    }

    return input;
  }

  /**
   * Validates that input is a valid session ID format
   * @param input - The input to validate
   * @throws Error if input is not a valid session ID
   */
  public static validateSessionId(input: unknown): string {
    if (typeof input !== 'string') {
      throw new Error('Session ID must be a string');
    }

    // Session IDs follow the pattern: session_<timestamp>_<random>
    // Allow alphanumeric characters, hyphens, and underscores
    const sessionIdPattern = /^session_\d+_[a-zA-Z0-9]+$/;

    if (!sessionIdPattern.test(input)) {
      throw new Error('Invalid session ID format');
    }

    return input;
  }

  /**
   * Validates and sanitizes a language name
   * @param input - The input to validate
   * @throws Error if input contains invalid characters
   */
  public static validateLanguageName(input: unknown): string | undefined {
    if (input === undefined || input === null || input === '') {
      return undefined;
    }

    if (typeof input !== 'string') {
      throw new Error('Language name must be a string');
    }

    // Language names should only contain letters, numbers, and common separators
    const languagePattern = /^[a-zA-Z0-9+#\-_. ]{1,50}$/;

    if (!languagePattern.test(input)) {
      throw new Error('Invalid language name format');
    }

    return input.trim();
  }

  /**
   * Validates a user ID format
   * @param input - The input to validate
   * @throws Error if input is not a valid user ID
   */
  public static validateUserId(input: unknown): string {
    if (typeof input !== 'string') {
      throw new Error('User ID must be a string');
    }

    // User IDs should be alphanumeric with underscores
    const userIdPattern = /^[a-zA-Z0-9_-]{3,64}$/;

    if (!userIdPattern.test(input)) {
      throw new Error('Invalid user ID format');
    }

    return input;
  }

  /**
   * Sanitizes text to prevent XSS attacks
   * @param input - The text to sanitize
   * @returns Sanitized text safe for display
   */
  public static sanitizeText(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    const htmlEntities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };

    return input.replace(/[&<>"'/]/g, (char) => htmlEntities[char] || char);
  }

  /**
   * Validates that an object has required properties
   * @param obj - The object to validate
   * @param requiredProps - Array of required property names
   * @param objectName - Name of the object for error messages
   * @throws Error if any required property is missing
   */
  public static validateRequiredProperties(
    obj: unknown,
    requiredProps: string[],
    objectName: string
  ): void {
    if (typeof obj !== 'object' || obj === null) {
      throw new Error(`${objectName} must be an object`);
    }

    for (const prop of requiredProps) {
      if (!(prop in obj)) {
        throw new Error(`${objectName} is missing required property: ${prop}`);
      }
    }
  }

  /**
   * Validates an integer within a range
   * @param input - The input to validate
   * @param fieldName - Name of the field for error messages
   * @param min - Minimum allowed value (inclusive)
   * @param max - Maximum allowed value (inclusive)
   * @throws Error if input is not a valid integer or outside range
   */
  public static validateInteger(
    input: unknown,
    fieldName: string,
    min: number,
    max: number
  ): number {
    const num = this.validateNumberInRange(input, fieldName, min, max);

    if (!Number.isInteger(num)) {
      throw new Error(`${fieldName} must be an integer`);
    }

    return num;
  }
}
