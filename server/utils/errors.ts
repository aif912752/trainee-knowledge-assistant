import { 
  ApiError, 
  BadRequestError, 
  UnauthorizedError, 
  ForbiddenError, 
  NotFoundError, 
  ValidationError, 
  InternalServerError 
} from '~~/shared/errors';

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
 * Error handler for API routes
 * Returns both response data and status code
 */
export function handleApiError(error: unknown): {
  data: { success: false; error: string; code?: string };
  status: number;
} {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return {
      data: {
        success: false,
        error: error.message,
        code: error.code
      },
      status: error.statusCode
    };
  }

  if (error instanceof Error) {
    return {
      data: {
        success: false,
        error: error.message,
        code: 'UNKNOWN_ERROR'
      },
      status: 500
    };
  }

  return {
    data: {
      success: false,
      error: 'เกิดข้อผิดพลาดที่ไม่คาดคิด',
      code: 'UNKNOWN_ERROR'
    },
    status: 500
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
