import { vi } from 'vitest';

// Mock useRuntimeConfig for tests
vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    databasePath: ':memory:',
    zaiApiKey: 'test-api-key',
    zaiApiBase: 'https://api.zai.com',
    openrouterApiKey: 'test-openrouter-key',
    openrouterApiBase: 'https://api.openrouter.ai',
    sessionSecret: 'test-session-secret',
  }),
}));

// Mock session utilities
vi.mock('~~/server/utils/session', () => ({
  getSessionUserId: vi.fn(() => null),
  createUserSession: vi.fn(),
  clearUserSession: vi.fn(),
}));

// Mock Nuxt/H3 globals
global.defineEventHandler = (handler: any) => handler;
global.setResponseStatus = vi.fn();
global.useRuntimeConfig = () => ({
  databasePath: ':memory:',
  zaiApiKey: 'test-api-key',
  zaiApiBase: 'https://api.zai.com',
  openrouterApiKey: 'test-openrouter-key',
  openrouterApiBase: 'https://api.openrouter.ai',
  sessionSecret: 'test-session-secret',
});

// Mock $fetch globally
global.$fetch = vi.fn();
