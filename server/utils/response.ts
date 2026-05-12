import type { H3Event } from 'h3';

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

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
