// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  // Configure directory structure
  srcDir: '.',

  modules: ["@nuxtjs/tailwindcss", "shadcn-nuxt", "nuxt-security"],

  runtimeConfig: {
    // Server-side environment variables (private)
    zaiApiKey: process.env.ZAI_API_KEY || '',
    zaiApiBase: process.env.ZAI_API_BASE || 'https://api.z.ai/api/anthropic',
    databasePath: process.env.DATABASE_PATH || './data/app.db',
    sessionSecret: process.env.SESSION_SECRET || 'change-this-in-production',

    // Public environment variables (exposed to client)
    public: {
      appUrl: process.env.APP_URL || 'http://localhost:3000',
    },
  },

  ssr: true,

  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: false, // Disable for now, will enable later
  },

  // Auto-import configurations
  imports: {
    dirs: ['types', 'shared'], // Auto-import types and shared utilities
  },

  // Security headers configuration
  security: {
    // Enable security headers
    headers: {
      xFrameOptions: 'DENY', // Prevent clickjacking
      xContentTypeOptions: 'nosniff', // Prevent MIME sniffing
      xXSSProtection: '1; mode=block', // XSS protection
      referrerPolicy: 'no-referrer', // No referrer policy
      contentSecurityPolicy: {
        // CSP for basic protection
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'connect-src': ["'self'"],
      }
    }
  },

  shadcn: {
    /**
     * Prefix for all the imported component.
     * @default "Ui"
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * Will respect the Nuxt aliases.
     * @link https://nuxt.com/docs/api/nuxt-config#alias
     * @default "@/components/ui"
     */
    componentDir: "~/app/components/ui",
  },
});
