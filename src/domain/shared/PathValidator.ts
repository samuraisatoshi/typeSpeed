import { ValueObject } from './ValueObject';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Value object for validating and sanitizing file system paths
 * Provides protection against path traversal attacks
 */
export class PathValidator extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  /**
   * Creates a validated path that ensures it's within allowed directories
   * @param inputPath - The path to validate
   * @param allowedBasePaths - Array of allowed base directories
   * @throws Error if path is invalid or outside allowed directories
   */
  public static create(inputPath: string, allowedBasePaths: string[]): PathValidator {
    if (!inputPath || typeof inputPath !== 'string') {
      throw new Error('Path must be a non-empty string');
    }

    // Normalize the path to resolve any '..' or '.' segments
    const normalizedPath = path.resolve(inputPath);

    // Validate the path doesn't contain malicious patterns
    this.validatePathSafety(inputPath);

    // Ensure path exists
    if (!fs.existsSync(normalizedPath)) {
      throw new Error(`Path does not exist: ${inputPath}`);
    }

    // Verify the path is within allowed directories
    if (!this.isWithinAllowedPaths(normalizedPath, allowedBasePaths)) {
      throw new Error('Access denied: Path is outside allowed directories');
    }

    return new PathValidator(normalizedPath);
  }

  /**
   * Validates that the path doesn't contain malicious patterns
   */
  private static validatePathSafety(inputPath: string): void {
    // Check for null bytes
    if (inputPath.includes('\0')) {
      throw new Error('Path contains invalid null byte');
    }

    // Check for other suspicious patterns
    const suspiciousPatterns = [
      /\.\.[\\/]/,     // Parent directory traversal
      /^\.\.$/,        // Parent directory reference
      /[\\/]\.\.$/,    // Ending with parent directory
      /[\\/]\.\.[\/\\]/, // Parent directory in middle
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(inputPath)) {
        throw new Error('Path contains suspicious directory traversal patterns');
      }
    }
  }

  /**
   * Checks if the resolved path is within any of the allowed base paths
   */
  private static isWithinAllowedPaths(
    normalizedPath: string,
    allowedBasePaths: string[]
  ): boolean {
    if (!allowedBasePaths || allowedBasePaths.length === 0) {
      // If no allowed paths specified, reject for safety
      return false;
    }

    // Normalize all allowed paths
    const normalizedAllowedPaths = allowedBasePaths.map(p => path.resolve(p));

    // Check if the normalized path starts with any allowed base path
    return normalizedAllowedPaths.some(allowedPath => {
      // Ensure proper path separator at the end for accurate comparison
      const allowedPathWithSep = allowedPath.endsWith(path.sep)
        ? allowedPath
        : allowedPath + path.sep;

      const normalizedPathWithSep = normalizedPath.endsWith(path.sep)
        ? normalizedPath
        : normalizedPath + path.sep;

      // Check if paths are equal or if normalizedPath is a subdirectory
      return normalizedPath === allowedPath ||
             normalizedPathWithSep.startsWith(allowedPathWithSep);
    });
  }

  /**
   * Returns the validated path as a string
   */
  public toString(): string {
    return this.value;
  }

  /**
   * Gets the absolute path
   */
  public getAbsolutePath(): string {
    return this.value;
  }
}
