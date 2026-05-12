import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [],
  test: {
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.nuxt/**'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['server/**/*.ts', 'app/**/*.ts', 'shared/**/*.ts'],
      exclude: ['**/*.test.ts', '**/node_modules/**', '**/.nuxt/**'],
    },
    setupFiles: ['./test/setup.ts'],
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, '.'),
      '~/server': resolve(__dirname, 'server'),
      '~/app': resolve(__dirname, 'app'),
      '~/shared': resolve(__dirname, 'shared'),
      '~/types': resolve(__dirname, 'types'),
      '~~': resolve(__dirname, '.'),
    },
  },
});
