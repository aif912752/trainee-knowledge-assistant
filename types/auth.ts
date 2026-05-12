import type { UserWithoutPassword } from './user';

export interface LoginInput {
  username: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  user?: UserWithoutPassword;
  error?: string;
}
