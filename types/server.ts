import type { H3Event } from 'h3';
import type { UserWithoutPassword } from './user';
import type { AuthService } from '~~/server/services/auth.service';
import type { ChatService } from '~~/server/services/chat.service';
import type { DocumentService } from '~~/server/services/document.service';
import type { UserRepository } from '~~/server/repositories/user.repository';
import type { SessionRepository } from '~~/server/repositories/session.repository';
import type { MessageRepository } from '~~/server/repositories/message.repository';
import type { DocumentRepository } from '~~/server/repositories/document.repository';
import type { TokenRepository } from '~~/server/repositories/token.repository';
import type Database from 'better-sqlite3';

declare module 'h3' {
  interface H3EventContext {
    user?: UserWithoutPassword;
    db: Database.Database;
    authService: AuthService;
    chatService: ChatService;
    documentService: DocumentService;
    repositories: {
      user: UserRepository;
      session: SessionRepository;
      message: MessageRepository;
      document: DocumentRepository;
      token: TokenRepository;
    };
  }
}
