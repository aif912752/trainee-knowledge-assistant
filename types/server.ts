import type { H3Event } from 'h3';
import type { UserWithoutPassword } from './user';

declare module 'h3' {
  interface H3EventContext {
    user?: UserWithoutPassword;
  }
}
