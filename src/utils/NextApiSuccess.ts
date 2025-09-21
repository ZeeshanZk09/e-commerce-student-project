import { NextResponse } from 'next/server';

/**
 * Standardized success response class for API responses in Next.js App Router applications
 * Provides consistent success response formatting with metadata and typing
 */
class ApiSuccess<T = unknown> {
  public readonly success: boolean = true;
  public readonly data: T;
  public readonly metadata?: Record<string, unknown>;
  public readonly statusCode: number;

  /**
   * @param data - The main response data
   * @param statusCode - HTTP status code (default: 200)
   * @param metadata - Additional metadata about the response
   */
  constructor(data: T, statusCode: number = 200, metadata?: Record<string, unknown>) {
    if (statusCode < 200 || statusCode > 299) {
      throw new Error(`Status code ${statusCode} is not a success status code`);
    }

    this.data = data;
    this.statusCode = statusCode;
    this.metadata = metadata;
  }

  /**
   * Creates a NextResponse with the success formatted consistently
   */
  public toNextResponse(): NextResponse {
    const responseBody: Record<string, unknown> = {
      success: this.success,
      data: this.data,
    };

    if (this.metadata && Object.keys(this.metadata).length > 0) {
      responseBody.metadata = this.metadata;
    }

    return NextResponse.json(responseBody, { status: this.statusCode });
  }

  /**
   * Converts success response to a serializable object
   */
  public toObject(): Record<string, unknown> {
    return {
      success: this.success,
      data: this.data,
      ...(this.metadata && { metadata: this.metadata }),
    };
  }

  /**
   * Returns JSON string representation
   */
  public toJSON(): string {
    return JSON.stringify(this.toObject());
  }

  /**
   * Factory method to create an ApiSuccess
   * @param data - The response data
   * @param statusCode - HTTP status code
   * @param metadata - Additional metadata
   */
  public static create<T>(
    data: T,
    statusCode: number = 200,
    metadata?: Record<string, unknown>
  ): ApiSuccess<T> {
    return new ApiSuccess(data, statusCode, metadata);
  }

  /**
   * Quick factory methods for common status codes
   */
  public static ok<T>(data: T, metadata?: Record<string, unknown>): ApiSuccess<T> {
    return new ApiSuccess(data, 200, metadata);
  }

  public static created<T>(data: T, metadata?: Record<string, unknown>): ApiSuccess<T> {
    return new ApiSuccess(data, 201, metadata);
  }

  public static accepted<T>(data: T, metadata?: Record<string, unknown>): ApiSuccess<T> {
    return new ApiSuccess(data, 202, metadata);
  }

  public static noContent(metadata?: Record<string, unknown>): ApiSuccess<null> {
    return new ApiSuccess(null, 204, metadata);
  }

  /**
   * Creates a NextResponse directly from parameters
   * Utility method for quick success responses
   */
  public static nextResponse<T>(
    data: T,
    statusCode: number = 200,
    metadata?: Record<string, unknown>
  ): NextResponse {
    const success = new ApiSuccess(data, statusCode, metadata);
    return success.toNextResponse();
  }

  /**
   * Creates a response with timing metadata
   */
  public static withTiming<T>(
    data: T,
    startTime: number,
    statusCode: number = 200,
    additionalMetadata?: Record<string, unknown>
  ): NextResponse {
    const metadata: Record<string, unknown> = {
      responseTime: `${Date.now() - startTime}ms`,
      ...additionalMetadata,
    };

    return ApiSuccess.nextResponse(data, statusCode, metadata);
  }

  /**
   * Check if a status code is a valid success code
   */
  public static isValidSuccessCode(statusCode: number): boolean {
    return statusCode >= 200 && statusCode <= 299;
  }
}

export { ApiSuccess };
export type { ApiSuccess as ApiSuccessType };
