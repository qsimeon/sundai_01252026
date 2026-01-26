import { ZodError } from 'zod'
import { ErrorResponse } from './schemas'

/**
 * Base application error class
 * All application-specific errors inherit from this
 */
export class AppError extends Error {
  public readonly code: string
  public readonly statusCode: number

  constructor(message: string, code: string, statusCode: number) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.statusCode = statusCode
    Error.captureStackTrace(this, this.constructor)
  }

  /**
   * Convert error to API response format
   */
  toResponse(): ErrorResponse {
    return {
      error: this.message,
      code: this.code as 'VALIDATION_ERROR' | 'REPLICATE_ERROR' | 'INTERNAL_ERROR',
    }
  }
}

/**
 * Validation error: thrown when input validation fails
 * Used for user input, request parameters, etc.
 */
export class ValidationError extends AppError {
  public readonly fieldErrors?: Record<string, string[]>

  constructor(message: string, fieldErrors?: Record<string, string[]>) {
    super(message, 'VALIDATION_ERROR', 400)
    this.fieldErrors = fieldErrors
  }

  /**
   * Convert ZodError to ValidationError
   * Extracts field-level error messages
   */
  static fromZodError(error: ZodError): ValidationError {
    const fieldErrors: Record<string, string[]> = {}

    error.issues.forEach((issue) => {
      const path = issue.path.join('.')
      if (!fieldErrors[path]) {
        fieldErrors[path] = []
      }
      fieldErrors[path].push(issue.message)
    })

    const firstError = error.issues[0]?.message || 'Validation failed'

    return new ValidationError(firstError, fieldErrors)
  }

  override toResponse(): ErrorResponse {
    return {
      error: this.message,
      code: 'VALIDATION_ERROR',
      fieldErrors: this.fieldErrors,
    }
  }
}

/**
 * Replicate API error: thrown when external Replicate API fails
 * Used for API communication, rate limits, model errors, etc.
 */
export class ReplicateError extends AppError {
  public readonly replicateDetails?: unknown

  constructor(message: string, statusCode: number = 502, details?: unknown) {
    super(message, 'REPLICATE_ERROR', statusCode)
    this.replicateDetails = details
  }

  override toResponse(): ErrorResponse {
    return {
      error: this.message,
      code: 'REPLICATE_ERROR',
    }
  }
}

/**
 * API error: thrown for internal API errors
 * Used for unexpected server-side issues
 */
export class ApiError extends AppError {
  constructor(message: string, statusCode: number = 500) {
    super(message, 'INTERNAL_ERROR', statusCode)
  }

  override toResponse(): ErrorResponse {
    return {
      error: this.message,
      code: 'INTERNAL_ERROR',
    }
  }
}

/**
 * Format an error as an API response
 * Determines status code and response body from error type
 */
export function formatErrorResponse(error: unknown): {
  statusCode: number
  body: ErrorResponse
} {
  if (error instanceof ValidationError) {
    return {
      statusCode: 400,
      body: error.toResponse(),
    }
  }

  if (error instanceof ReplicateError) {
    return {
      statusCode: error.statusCode,
      body: error.toResponse(),
    }
  }

  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      body: error.toResponse(),
    }
  }

  // Fallback for unknown errors
  const message = error instanceof Error ? error.message : 'An unknown error occurred'
  return {
    statusCode: 500,
    body: {
      error: message,
      code: 'INTERNAL_ERROR',
    },
  }
}
