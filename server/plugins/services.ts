import { AuthService } from '~~/server/services/auth.service';
import { ChatService } from '~~/server/services/chat.service';
import { DocumentService } from '~~/server/services/document.service';
import { SessionRepository } from '~~/server/repositories/session.repository';
import { UserRepository } from '~~/server/repositories/user.repository';
import { MessageRepository } from '~~/server/repositories/message.repository';
import { DocumentRepository } from '~~/server/repositories/document.repository';
import { TokenRepository } from '~~/server/repositories/token.repository';
import { getDatabase } from '~~/server/db';
import { useRuntimeConfig } from '#imports';

/**
 * Singleton Services Plugin
 * Initializes service instances once on server startup
 * and attaches them to event.context for use in API handlers
 */
export default defineNitroPlugin((nitroApp) => {
  const db = getDatabase();
  const config = useRuntimeConfig();

  // Create singleton repositories
  const repositories = {
    user: new UserRepository(db),
    session: new SessionRepository(db),
    message: new MessageRepository(db),
    document: new DocumentRepository(db),
    token: new TokenRepository(db),
  };

  // Create singleton services
  const authService = new AuthService(repositories.user);
  const chatService = new ChatService(
    repositories.message,
    repositories.token,
    repositories.document,
    config
  );
  const documentService = new DocumentService(repositories.document);

  // Attach to nitroApp context for access via event.context
  nitroApp.hooks.hook('request', (event) => {
    event.context.repositories = repositories;
    event.context.authService = authService;
    event.context.chatService = chatService;
    event.context.documentService = documentService;
  });

  console.log('✅ Services plugin loaded (singleton mode)');
});
