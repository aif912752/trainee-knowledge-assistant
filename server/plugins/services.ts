import { AuthService } from '~~/server/services/auth.service';
import { ChatService } from '~~/server/services/chat.service';
import { DocumentService } from '~~/server/services/document.service';
import { SessionRepository } from '~~/server/repositories/session.repository';
import { UserRepository } from '~~/server/repositories/user.repository';
import { MessageRepository } from '~~/server/repositories/message.repository';
import { DocumentRepository } from '~~/server/repositories/document.repository';
import { TokenRepository } from '~~/server/repositories/token.repository';
import { useRuntimeConfig } from '#imports';
import type Database from 'better-sqlite3';

/**
 * Singleton Services Plugin
 * Initializes service instances once on server startup
 * Uses db from event.context (initialized by database plugin)
 *
 * IMPORTANT: database.ts plugin must load first
 */
export default defineNitroPlugin((nitroApp) => {
  const config = useRuntimeConfig();

  // Get db from first request context (database plugin attaches it)
  // We'll create services lazily when first request comes in
  let repositories: any = null;
  let authService: AuthService | null = null;
  let chatService: ChatService | null = null;
  let documentService: DocumentService | null = null;

  nitroApp.hooks.hook('request', (event) => {
    // Get db from context (attached by database plugin)
    const db = (event as any).context.db as Database.Database;

    if (!db) {
      throw new Error('Database not found in event.context - database plugin may not have loaded');
    }

    // Create repositories and services on first request (lazy init)
    if (!repositories) {
      repositories = {
        user: new UserRepository(db),
        session: new SessionRepository(db),
        message: new MessageRepository(db),
        document: new DocumentRepository(db),
        token: new TokenRepository(db),
      };

      authService = new AuthService(repositories.user);
      chatService = new ChatService(
        repositories.message,
        repositories.token,
        repositories.document,
        config
      );
      documentService = new DocumentService(repositories.document);

      console.log('✅ Services initialized (lazy load)');
    }

    // Attach to event context for API handlers
    (event as any).context.repositories = repositories;
    (event as any).context.authService = authService;
    (event as any).context.chatService = chatService;
    (event as any).context.documentService = documentService;
  });

  console.log('✅ Services plugin loaded');
});
