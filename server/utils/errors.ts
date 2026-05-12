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
import type { ApiErrorResponse } from '~~/shared/api-response';

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
export interface ApiErrorLogContext {
  path?: string;
  method?: string;
  userId?: number;
  statusCode?: number;
  code?: string;
}

export function apiErrorLogger(error: unknown, context: ApiErrorLogContext = {}): void {
  console.error('API Error:', {
    error,
    context,
  });
}

function getRequestPath(event: H3Event): string {
  const requestUrl = event.node.req.url || '';

  try {
    return new URL(requestUrl, 'http://localhost').pathname;
  } catch {
    return requestUrl.split('?')[0] || '';
  }
}

/**
 * Centralized error handler for API routes.
 * Sets response status and returns standardized error response.
 */
export function handleApiError(
  event: H3Event,
  error: unknown
): ApiErrorResponse {
  const context: ApiErrorLogContext = {
    path: getRequestPath(event),
    method: event.node.req.method || undefined,
    userId: event.context.user?.id,
  };

  if (error instanceof ApiError) {
    context.statusCode = error.statusCode;
    context.code = error.code;
    apiErrorLogger(error, context);
    setResponseStatus(event, error.statusCode);
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }

  if (error instanceof Error) {
    context.statusCode = 500;
    context.code = 'UNKNOWN_ERROR';
    apiErrorLogger(error, context);
    setResponseStatus(event, 500);
    return {
      success: false,
      error: error.message,
      code: 'UNKNOWN_ERROR'
    };
  }

  context.statusCode = 500;
  context.code = 'UNKNOWN_ERROR';
  apiErrorLogger(error, context);
  setResponseStatus(event, 500);
  return {
    success: false,
    error: 'เกิดข้อผิดพลาดที่ไม่คาดคิด',
    code: 'UNKNOWN_ERROR'
  };
}
