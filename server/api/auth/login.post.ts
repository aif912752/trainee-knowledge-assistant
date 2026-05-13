import { validateBody } from '~~/shared/validations/helpers';
import { loginSchema } from '~~/shared/validations';
import { createUserSession } from '~~/server/utils/session';
import { UnauthorizedError, handleApiError } from '~~/server/utils/errors';
import { successResponse } from '~~/server/utils/response';
import type { LoginInput } from '~~/types/auth';

/**
 * Login API endpoint
 * POST /api/auth/login
 * Uses singleton AuthService from event.context
 */
export default defineEventHandler(async (event) => {
  try {
    // Validate request body
    const body = await readBody(event);
    const input = validateBody<LoginInput>(loginSchema, body);

    // Authenticate user (using singleton from plugin)
    const authService = event.context.authService;
    const result = await authService.login(input);

    // Check if authentication failed
    if (!result.success) {
      throw new UnauthorizedError(result.error || 'การยืนยันตัวตนล้มเหลว');
    }

    // Create session cookie
    createUserSession(event, result.user!);

    // Return user data
    return successResponse(event, { user: result.user });

  } catch (error) {
    return handleApiError(event, error);
  }
});
