import bcrypt from 'bcrypt';
import { UserRepository } from '~/server/repositories/user.repository';
import type { User } from '~/server/repositories/user.repository';

export interface LoginInput {
  username: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  user?: Omit<User, 'password_hash'>;
  error?: string;
}

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    const db = getDatabase();
    this.userRepository = new UserRepository(db);
  }

  /**
   * Hash password with bcrypt
   */
  hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  /**
   * Verify password against hash
   */
  verifyPassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }

  /**
   * Authenticate user with username and password
   */
  async login(input: LoginInput): Promise<LoginResult> {
    // Validate input
    if (!input.username || !input.password) {
      return {
        success: false,
        error: 'Username and password are required'
      };
    }

    // Find user by username
    const user = this.userRepository.findByUsername(input.username);

    if (!user) {
      return {
        success: false,
        error: 'Invalid credentials'
      };
    }

    // Verify password
    const isValid = this.verifyPassword(input.password, user.password_hash);

    if (!isValid) {
      return {
        success: false,
        error: 'Invalid credentials'
      };
    }

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user;

    return {
      success: true,
      user: userWithoutPassword
    };
  }

  /**
   * Get user by ID
   */
  getUserById(id: number): Omit<User, 'password_hash'> | undefined {
    const user = this.userRepository.findById(id);

    if (!user) {
      return undefined;
    }

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Validate session
   */
  validateSession(userId: number): boolean {
    const user = this.userRepository.findById(userId);
    return !!user;
  }
}
