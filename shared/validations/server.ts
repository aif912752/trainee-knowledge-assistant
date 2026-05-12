import { ZodError } from 'zod';
import { BadRequestError, ValidationError } from './errors';

/**
 * Validate request body against schema
 * @throws BadRequestError if validation fails
 */
export function validateBody<T>(schema: any, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    // Format error messages
    const errors = result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));

    throw new BadRequestError(
      `การตรวจสอบข้อมูลล้มเหลว: ${errors.map(e => `${e.field}: ${e.message}`).join(', ')}`
    );
  }

  return result.data as T;
}

/**
 * Safe validation - returns result without throwing
 */
export function safeValidate<T>(schema: any, data: unknown) {
  return schema.safeParse(data);
}

/**
 * Validate and throw if invalid
 */
export function validateOrThrow<T>(schema: any, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ValidationError(result.error.errors[0].message);
  }

  return result.data as T;
}
