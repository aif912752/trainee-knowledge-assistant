import type { H3Event } from 'h3';
import type { ApiSuccessResponse } from '~~/shared/api-response';

export function successResponse<T>(
  event: H3Event,
  data: T,
  message?: string,
  status: number = 200
): ApiSuccessResponse<T> {
  setResponseStatus(event, status);

  return {
    success: true,
    data,
    ...(message ? { message } : {}),
  };
}
