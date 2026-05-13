import { InternalServerError } from '~~/shared/errors';

/**
 * Base class for all backend external API services
 */
export abstract class BaseApiService {
  /**
   * Protected request method to be used by child services
   * Uses Nuxt useRuntimeConfig for global settings if needed
   */
  protected async request<T>(url: string, options: any = {}): Promise<T> {
    const serviceName = this.constructor.name;
    // useRuntimeConfig() is a Nuxt/Nitro global
    const config = useRuntimeConfig();
    
    // Merge headers: Default JSON -> Method specific
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      return await $fetch<T>(url, {
        ...options,
        headers,
        timeout: options.timeout || 30000,
      });
    } catch (error: any) {
      console.error(`[${serviceName}] API Request Failed:`, {
        url,
        status: error.status,
        message: error.message,
        data: error.data
      });

      if (error.status) {
        throw new InternalServerError(
          `การเชื่อมต่อกับบริการภายนอกล้มเหลว (${serviceName})`,
          'EXTERNAL_SERVICE_ERROR'
        );
      }

      throw error;
    }
  }

  /**
   * Helper for POST requests
   * @param headers Optional headers to merge
   */
  protected async post<T>(url: string, body: any, headers: Record<string, string> = {}, options: any = {}): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body,
      headers: { ...headers, ...options.headers }
    });
  }

  /**
   * Helper for POST Streaming requests
   * Uses standard fetch because $fetch is not optimized for streaming responses
   */
  protected async postStream(url: string, body: any, headers: Record<string, string> = {}): Promise<Response> {
    const serviceName = this.constructor.name;
    
    const requestHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[${serviceName}] Streaming Request Failed:`, {
          url,
          status: response.status,
          error: errorText
        });
        throw new InternalServerError(`การเชื่อมต่อ Streaming ล้มเหลว (${serviceName})`);
      }

      return response;
    } catch (error: any) {
      if (error instanceof InternalServerError) throw error;
      
      console.error(`[${serviceName}] Streaming Network Error:`, error.message);
      throw new InternalServerError(`ไม่สามารถเริ่มต้นการเชื่อมต่อ Streaming ได้ (${serviceName})`);
    }
  }

  /**
   * Helper for GET requests
   * @param query Optional query parameters
   * @param headers Optional headers to merge
   */
  protected async get<T>(url: string, query: any = {}, headers: Record<string, string> = {}, options: any = {}): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'GET',
      query,
      headers: { ...headers, ...options.headers }
    });
  }
}
