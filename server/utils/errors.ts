import { 
  ApiError, 
  BadRequestError, 
  UnauthorizedError, 
  ForbiddenError, 
  NotFoundError, 
  ValidationError, 
  InternalServerError 
} from '~~/shared/errors';
import type { H3Event } from 'h3';

export { 
  ApiError, 
  BadRequestError, 
  UnauthorizedError, 
  ForbiddenError, 
  NotFoundError, 
  ValidationError, 
  InternalServerError 
};

/**
 * Centralized API error logger.
 * Keep logging here so route handlers do not need their own error logging.
 */
export function apiErrorLogger(error: unknown): void {
  console.error('API Error:', error);
}

/**
 * Centralized error handler for API routes.
 * Sets response status and returns standardized error response.
 */
export function handleApiError(
  event: H3Event,
  error: unknown
): { success: false; error: string; code?: string } {
  apiErrorLogger(error);

  if (error instanceof ApiError) {
    setResponseStatus(event, error.statusCode);
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }

  if (error instanceof Error) {
    setResponseStatus(event, 500);
    return {
      success: false,
      error: error.message,
      code: 'UNKNOWN_ERROR'
    };
  }

  setResponseStatus(event, 500);
  return {
    success: false,
    error: 'เกิดข้อผิดพลาดที่ไม่คาดคิด',
    code: 'UNKNOWN_ERROR'
  };
}

/**
 * Async error handler wrapper
 */
export function asyncHandler<T>(
  fn: () => Promise<T>
): Promise<T> {
  return fn();
}
