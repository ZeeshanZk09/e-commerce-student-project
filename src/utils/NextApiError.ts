import { NextResponse } from 'next/server';

/**
 * Standardized error class for API responses in Next.js App Router applications
 * Provides consistent error formatting, logging, and HTTP status code handling
 */
class ApiError extends Error {
  public readonly statusCode: number;
  public readonly success: boolean;
  public readonly errors: unknown;
  public readonly isOperational: boolean;

  /**
   * @param statusCode - HTTP status code
   * @param message - Human-readable error message
   * @param errors - Additional error details or validation errors
   * @param isOperational - Whether this is an operational error (vs. programming error)
   */
  constructor(
    statusCode: number,
    message: string,
    errors: unknown = null,
    isOperational: boolean = true
  ) {
    const errorMessage = message || ApiError.getDefaultMessage(statusCode);
    super(errorMessage);

    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    this.isOperational = isOperational;
    this.name = 'ApiError';

    // Capture stack trace (excluding constructor call)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Creates a NextResponse with the error formatted according to your specification
   */
  public toNextResponse(): NextResponse {
    const responseBody = {
      error: this.message,
      ...(this.errors && typeof this.errors === 'object' ? { details: this.errors } : null),
    };

    return NextResponse.json(responseBody, { status: this.statusCode });
  }

  /**
   * Logs the error with structured formatting
   * @param logger - Optional logger (defaults to console)
   */
  public log(logger: Console = console): void {
    const logData: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
      errors: this.errors,
    };

    // Only include stack in development
    if (process.env.NODE_ENV === 'development') {
      logData.stack = this.stack;
    }

    if (this.statusCode >= 500) {
      logger.error('Server Error:', logData);
    } else if (this.statusCode >= 400) {
      logger.warn('Client Error:', logData);
    } else {
      logger.info('API Error:', logData);
    }
  }

  /**
   * Converts error to a serializable object for API responses
   * @param includeStack - Whether to include stack trace (defaults to development only)
   */
  public toObject(includeStack?: boolean): Record<string, unknown> {
    const includeStackTrace = includeStack ?? process.env.NODE_ENV === 'development';

    return {
      success: this.success,
      error: {
        name: this.name,
        message: this.message,
        statusCode: this.statusCode,
        ...(this.errors && typeof this.errors === 'object' ? { details: this.errors } : null),
        ...(includeStackTrace && { stack: this.stack }),
      },
    };
  }

  /**
   * Returns JSON string representation for API responses
   * @param includeStack - Whether to include stack trace
   */
  public toJSON(includeStack?: boolean): string {
    return JSON.stringify(this.toObject(includeStack));
  }

  /**
   * String representation of the error
   */
  public override toString(): string {
    return `${this.name}: [${this.statusCode}] ${this.message}`;
  }

  /**
   * Default error messages for common HTTP status codes
   * @param statusCode - HTTP status code
   */
  public static getDefaultMessage(statusCode: number): string {
    const messages: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      402: 'Payment Required',
      403: 'Forbidden',
      404: 'Not Found',
      405: 'Method Not Allowed',
      406: 'Not Acceptable',
      407: 'Proxy Authentication Required',
      408: 'Request Timeout',
      409: 'Conflict',
      410: 'Gone',
      411: 'Length Required',
      412: 'Precondition Failed',
      413: 'Payload Too Large',
      414: 'URI Too Long',
      415: 'Unsupported Media Type',
      416: 'Range Not Satisfiable',
      417: 'Expectation Failed',
      418: "I'm a teapot",
      422: 'Unprocessable Entity',
      425: 'Too Early',
      426: 'Upgrade Required',
      428: 'Precondition Required',
      429: 'Too Many Requests',
      431: 'Request Header Fields Too Large',
      451: 'Unavailable For Legal Reasons',
      500: 'Internal Server Error',
      501: 'Not Implemented',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout',
      505: 'HTTP Version Not Supported',
      506: 'Variant Also Negotiates',
      507: 'Insufficient Storage',
      508: 'Loop Detected',
      510: 'Not Extended',
      511: 'Network Authentication Required',
    };

    return `${statusCode}: ${messages[statusCode]}!` || `Error: ${statusCode}`;
  }

  /**
   * Factory method to create an ApiError
   * @param statusCode - HTTP status code
   * @param message - Error message
   * @param errors - Additional error details
   * @param isOperational - Whether this is an operational error
   */
  public static create(
    statusCode: number,
    message?: string,
    errors?: unknown,
    isOperational?: boolean
  ): ApiError {
    return new ApiError(
      statusCode,
      message || ApiError.getDefaultMessage(statusCode),
      errors,
      isOperational
    );
  }

  /**
   * Common error types for quick creation
   */
  public static badRequest(message?: string, errors?: unknown): ApiError {
    return ApiError.create(400, message, errors);
  }

  public static unauthorized(message?: string, errors?: unknown): ApiError {
    return ApiError.create(401, message, errors);
  }

  public static forbidden(message?: string, errors?: unknown): ApiError {
    return ApiError.create(403, message, errors);
  }

  public static notFound(message?: string, errors?: unknown): ApiError {
    return ApiError.create(404, message, errors);
  }

  public static conflict(message?: string, errors?: unknown): ApiError {
    return ApiError.create(409, message, errors);
  }

  public static unprocessableEntity(message?: string, errors?: unknown): ApiError {
    return ApiError.create(422, message, errors);
  }

  public static internal(message?: string, errors?: unknown): ApiError {
    return ApiError.create(500, message, errors, false);
  }

  /**
   * Creates a NextResponse directly from error parameters
   * Utility method for quick error responses
   */
  public static nextResponse(statusCode: number, message?: string, errors?: unknown): NextResponse {
    const error = new ApiError(
      statusCode,
      message || ApiError.getDefaultMessage(statusCode),
      errors
    );

    error.log();
    return error.toNextResponse();
  }
}

export { ApiError };
export type { ApiError as ApiErrorType };
