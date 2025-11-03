import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { SecurityConfig } from '../../domain/shared/SecurityConfig';

/**
 * Infrastructure service for configuring security middleware
 * Provides helmet configuration, rate limiting, and CORS settings
 */
export class SecurityMiddleware {
  private readonly securityConfig: SecurityConfig;

  constructor(securityConfig: SecurityConfig) {
    this.securityConfig = securityConfig;
  }

  /**
   * Configures Helmet middleware for security headers
   */
  public getHelmetMiddleware() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    });
  }

  /**
   * Creates rate limiter for general API endpoints
   */
  public getGeneralRateLimiter() {
    return rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: this.securityConfig.getMaxRequestsPerMinute(),
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      handler: (_req: Request, res: Response) => {
        res.status(429).json({
          error: 'Too many requests',
          message: 'You have exceeded the rate limit. Please try again later.',
          retryAfter: Math.ceil(60) // seconds
        });
      }
    });
  }

  /**
   * Creates strict rate limiter for expensive operations like scanning
   */
  public getStrictRateLimiter() {
    return rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: Math.floor(this.securityConfig.getMaxRequestsPerMinute() / 6), // 1/6 of general limit
      message: 'Too many scan requests, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      handler: (_req: Request, res: Response) => {
        res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'You have exceeded the rate limit for this operation. Please try again later.',
          retryAfter: Math.ceil(60) // seconds
        });
      }
    });
  }

  /**
   * Configures CORS options
   */
  public getCorsOptions() {
    const trustedOrigins = this.securityConfig.getTrustedOrigins();

    return {
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) {
          return callback(null, true);
        }

        if (trustedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
      maxAge: 86400 // 24 hours
    };
  }

  /**
   * Middleware to log security-relevant events
   */
  public securityLogger() {
    return (req: Request, _res: Response, next: NextFunction) => {
      const timestamp = new Date().toISOString();
      const { method, path, ip } = req;

      // Log security-relevant requests
      if (method !== 'GET' || path.includes('/api/scan')) {
        console.log(`[Security] ${timestamp} - ${method} ${path} from ${ip}`);
      }

      next();
    };
  }

  /**
   * Middleware to validate request body size
   */
  public requestSizeValidator(maxSize: number = 1024 * 100) { // 100KB default
    return (req: Request, res: Response, next: NextFunction): void => {
      const contentLength = req.headers['content-length'];

      if (contentLength && parseInt(contentLength) > maxSize) {
        res.status(413).json({
          error: 'Request payload too large',
          maxSize: maxSize
        });
        return;
      }

      next();
    };
  }

  /**
   * Middleware to prevent common attacks
   */
  public commonSecurityMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Prevent parameter pollution
      if (typeof req.query === 'object') {
        for (const key in req.query) {
          if (Array.isArray(req.query[key])) {
            req.query[key] = req.query[key][0];
          }
        }
      }

      // Remove potentially dangerous headers
      res.removeHeader('X-Powered-By');

      next();
      return;
    };
  }
}
