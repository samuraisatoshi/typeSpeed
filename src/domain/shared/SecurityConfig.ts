import { ValueObject } from './ValueObject';
import * as os from 'os';
import * as path from 'path';

export interface SecurityConfigProps {
  allowedScanPaths: string[];
  trustedOrigins: string[];
  maxRequestsPerMinute: number;
  maxScanDepth: number;
  maxFileSize: number;
}

/**
 * Value object representing security configuration for the application
 * Encapsulates all security-related settings in an immutable object
 */
export class SecurityConfig extends ValueObject<SecurityConfigProps> {
  private constructor(props: SecurityConfigProps) {
    super(props);
  }

  /**
   * Creates a SecurityConfig with validated settings
   * @param props - Security configuration properties
   * @throws Error if configuration is invalid
   */
  public static create(props: Partial<SecurityConfigProps> = {}): SecurityConfig {
    const defaultConfig: SecurityConfigProps = {
      allowedScanPaths: this.getDefaultAllowedPaths(),
      trustedOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
      maxRequestsPerMinute: 60,
      maxScanDepth: 5,
      maxFileSize: 1024 * 1024 // 1MB
    };

    const mergedConfig = { ...defaultConfig, ...props };

    this.validate(mergedConfig);

    return new SecurityConfig(mergedConfig);
  }

  /**
   * Gets default allowed paths based on the operating system
   */
  private static getDefaultAllowedPaths(): string[] {
    const homeDir = os.homedir();

    return [
      path.join(homeDir, 'Documents'),
      path.join(homeDir, 'Projects'),
      path.join(homeDir, 'Development'),
      path.join(homeDir, 'dev'),
      path.join(homeDir, 'workspace'),
      path.join(homeDir, 'repos'),
      path.join(homeDir, 'code'),
      path.join(homeDir, 'src'),
    ];
  }

  /**
   * Validates the security configuration
   */
  private static validate(config: SecurityConfigProps): void {
    if (!config.allowedScanPaths || config.allowedScanPaths.length === 0) {
      throw new Error('At least one allowed scan path must be specified');
    }

    if (!config.trustedOrigins || config.trustedOrigins.length === 0) {
      throw new Error('At least one trusted origin must be specified');
    }

    if (config.maxRequestsPerMinute <= 0) {
      throw new Error('Max requests per minute must be positive');
    }

    if (config.maxScanDepth <= 0) {
      throw new Error('Max scan depth must be positive');
    }

    if (config.maxFileSize <= 0) {
      throw new Error('Max file size must be positive');
    }

    // Validate each allowed path exists or is valid
    for (const scanPath of config.allowedScanPaths) {
      if (!scanPath || typeof scanPath !== 'string') {
        throw new Error('Invalid scan path in configuration');
      }
    }

    // Validate origin format
    for (const origin of config.trustedOrigins) {
      if (!this.isValidOrigin(origin)) {
        throw new Error(`Invalid origin format: ${origin}`);
      }
    }
  }

  /**
   * Validates origin URL format
   */
  private static isValidOrigin(origin: string): boolean {
    try {
      const url = new URL(origin);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Gets the list of allowed scan paths
   */
  public getAllowedScanPaths(): string[] {
    return [...this.value.allowedScanPaths];
  }

  /**
   * Gets the list of trusted origins for CORS
   */
  public getTrustedOrigins(): string[] {
    return [...this.value.trustedOrigins];
  }

  /**
   * Gets the maximum requests allowed per minute
   */
  public getMaxRequestsPerMinute(): number {
    return this.value.maxRequestsPerMinute;
  }

  /**
   * Gets the maximum scan depth
   */
  public getMaxScanDepth(): number {
    return this.value.maxScanDepth;
  }

  /**
   * Gets the maximum file size
   */
  public getMaxFileSize(): number {
    return this.value.maxFileSize;
  }

  /**
   * Creates a new SecurityConfig with additional allowed paths
   */
  public withAdditionalPaths(paths: string[]): SecurityConfig {
    return SecurityConfig.create({
      ...this.value,
      allowedScanPaths: [...this.value.allowedScanPaths, ...paths]
    });
  }

  /**
   * Creates a new SecurityConfig with additional trusted origins
   */
  public withAdditionalOrigins(origins: string[]): SecurityConfig {
    return SecurityConfig.create({
      ...this.value,
      trustedOrigins: [...this.value.trustedOrigins, ...origins]
    });
  }
}
