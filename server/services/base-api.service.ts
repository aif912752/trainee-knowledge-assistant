import { InternalServerError } from '~~/shared/errors';

interface RequestOptions extends Omit<Parameters<typeof $fetch>[1], 'headers'> {
  headers?: Record<string, string>;
  timeout?: number;
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
}

export abstract class BaseApiService {
  protected async request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const serviceName = this.constructor.name;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      return await $fetch<T>(url, {
        ...options,
        headers,
        timeout: options.timeout || 30000,
      });
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string; data?: unknown };
      console.error(`[${serviceName}] API Request Failed:`, {
        url,
        status: err.status,
        message: err.message,
        data: err.data
      });

      if (err.status) {
        throw new InternalServerError(
          `การเชื่อมต่อกับบริการภายนอกล้มเหลว (${serviceName})`,
          'EXTERNAL_SERVICE_ERROR'
        );
      }

      throw error;
    }
  }

  protected async post<T>(url: string, body: unknown, headers: Record<string, string> = {}, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body,
      headers: { ...headers, ...options.headers }
    });
  }

  protected async postStream(url: string, body: unknown, headers: Record<string, string> = {}): Promise<Response> {
    const serviceName = this.constructor.name;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(body),
      });

      const contentType = response.headers.get('content-type') || '';

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[${serviceName}] Streaming Request Failed:`, {
          url,
          status: response.status,
          contentType,
          error: errorText.slice(0, 500)
        });
        throw new InternalServerError(`การเชื่อมต่อ Streaming ล้มเหลว (${response.status})`);
      }

      if (contentType.includes('text/html')) {
        console.error(`[${serviceName}] Received HTML instead of Stream:`, url);
        throw new InternalServerError('ได้รับข้อมูลไม่ถูกต้องจาก AI Provider (URL อาจผิดหรือคีย์ไม่ถูกต้อง)');
      }

      return response;
    } catch (error: unknown) {
      if (error instanceof InternalServerError) throw error;

      const err = error as { message?: string };
      console.error(`[${serviceName}] Streaming Network Error:`, err.message);
      throw new InternalServerError(`ไม่สามารถเริ่มต้นการเชื่อมต่อ Streaming ได้ (${serviceName})`);
    }
  }

  protected async get<T>(url: string, query: Record<string, string | number | boolean | undefined> = {}, headers: Record<string, string> = {}, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'GET',
      query,
      headers: { ...headers, ...options.headers }
    });
  }
}
