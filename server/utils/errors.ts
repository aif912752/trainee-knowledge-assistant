/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Error types
 */
export class BadRequestError extends ApiError {
  constructor(message: string, code?: string) {
    super(400, message, code);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'ไม่มีสิทธิ์เข้าถึง') {
    super(401, message, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'ถูกปฏิเสธการเข้าถึง') {
    super(403, message, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'ไม่พบข้อมูล') {
    super(404, message, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(422, message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class InternalServerError extends ApiError {
  constructor(message: string = 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์') {
    super(500, message, 'INTERNAL_ERROR');
    this.name = 'InternalServerError';
  }
}

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
