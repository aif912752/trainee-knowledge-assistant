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
