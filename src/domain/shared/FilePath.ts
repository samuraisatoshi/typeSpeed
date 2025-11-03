import { ValueObject } from './ValueObject';
import * as path from 'path';

/**
 * Value object representing a file path
 */
export class FilePath extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  public static create(filePath: string): FilePath {
    const normalizedPath = path.normalize(filePath);

    if (!this.isValid(normalizedPath)) {
      throw new Error(`Invalid file path: ${filePath}`);
    }

    return new FilePath(normalizedPath);
  }

  private static isValid(filePath: string): boolean {
    // Basic validation - no null bytes, must be a string
    if (!filePath || typeof filePath !== 'string') {
      return false;
    }

    // Check for null bytes
    if (filePath.includes('\0')) {
      return false;
    }

    // Check for common invalid patterns
    const invalidPatterns = [
      /\.\.\//g,  // Directory traversal
      /^~/       // Home directory expansion (handle separately)
    ];

    for (const pattern of invalidPatterns) {
      if (pattern.test(filePath)) {
        return false;
      }
    }

    return true;
  }

  public getExtension(): string {
    return path.extname(this.value);
  }

  public getBasename(): string {
    return path.basename(this.value);
  }

  public getDirname(): string {
    return path.dirname(this.value);
  }

  public getFilenameWithoutExtension(): string {
    const basename = this.getBasename();
    const extension = this.getExtension();
    return basename.slice(0, basename.length - extension.length);
  }

  public isAbsolute(): boolean {
    return path.isAbsolute(this.value);
  }

  public toString(): string {
    return this.value;
  }

  public join(...paths: string[]): FilePath {
    return FilePath.create(path.join(this.value, ...paths));
  }
}