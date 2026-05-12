export interface User {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
}

export type UserWithoutPassword = Omit<User, 'password_hash'>;

export interface CreateUserInput {
  username: string;
  password_hash: string;
}
