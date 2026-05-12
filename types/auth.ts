import type { UserWithoutPassword } from './user';
import type { LoginInput } from '~~/shared/validations';

export type { LoginInput };

export interface LoginResult {
  success: boolean;
  user?: UserWithoutPassword;
  error?: string;
}
