import { AuthService } from '~~/server/services/auth.service';
import { ChatService } from '~~/server/services/chat.service';
import { DocumentService } from '~~/server/services/document.service';
import { SessionRepository } from '~~/server/repositories/session.repository';
import { UserRepository } from '~~/server/repositories/user.repository';
import { MessageRepository } from '~~/server/repositories/message.repository';
import { DocumentRepository } from '~~/server/repositories/document.repository';
import { TokenRepository } from '~~/server/repositories/token.repository';
import { getDatabase } from '~~/server/db';

/**
 * Singleton Services Plugin
 * Initializes service instances once on server startup.
 * Attaches service instances to every request context.
 */
export default defineNitroPlugin((nitroApp) => {
  try {
    const config = useRuntimeConfig();
    const db = getDatabase();

    // Initialize repositories and services once on startup
    const repositories = {
      user: new UserRepository(db),
      session: new SessionRepository(db),
      message: new MessageRepository(db),
      document: new DocumentRepository(db),
      token: new TokenRepository(db),
    };

    const authService = new AuthService(repositories.user);
    const chatService = new ChatService(
      repositories.message,
      repositories.token,
      repositories.document,
      {
        zaiApiKey: config.zaiApiKey,
        zaiApiBase: config.zaiApiBase,
        primaryModel: config.public.primaryModel,
        primaryModelDisplayName: config.public.primaryModelDisplayName,
        openrouterApiKey: config.openrouterApiKey,
        openrouterApiBase: config.openrouterApiBase,
        fallbackModel: config.fallbackModel,
      }
    );
    const documentService = new DocumentService(repositories.document);

    // Attach to event context for all requests
    nitroApp.hooks.hook('request', (event) => {
      event.context.db = db;
      event.context.repositories = repositories;
      event.context.authService = authService;
      event.context.chatService = chatService;
      event.context.documentService = documentService;
    });

    console.log('✅ Services initialized and attached to request context');
  } catch (error) {
    console.error('❌ Failed to initialize services plugin:', error);
    // Don't re-throw here to allow Nitro to start, but subsequent requests will fail if they need these services
  }
});
