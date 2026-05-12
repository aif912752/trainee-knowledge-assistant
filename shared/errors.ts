/**
 * Shared Error classes for both Frontend and Backend
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

export class BadRequestError extends ApiError {
  constructor(message: string, code: string = 'BAD_REQUEST') {
    super(400, message, code);
    this.name = 'BadRequestError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, code: string = 'VALIDATION_ERROR') {
    super(422, message, code);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'ไม่มีสิทธิ์เข้าถึง', code: string = 'UNAUTHORIZED') {
    super(401, message, code);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'ถูกปฏิเสธการเข้าถึง', code: string = 'FORBIDDEN') {
    super(403, message, code);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'ไม่พบข้อมูล', code: string = 'NOT_FOUND') {
    super(404, message, code);
    this.name = 'NotFoundError';
  }
}

export class InternalServerError extends ApiError {
  constructor(message: string = 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์', code: string = 'INTERNAL_ERROR') {
    super(500, message, code);
    this.name = 'InternalServerError';
  }
}
