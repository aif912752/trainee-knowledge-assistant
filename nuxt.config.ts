import { fileURLToPath } from 'node:url'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@nuxtjs/tailwindcss", "shadcn-nuxt", "nuxt-security"],

  css: ['~/assets/css/tailwind.css'],

  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    exposeConfig: true,
    viewer: true,
  },

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
    dirs: [
      fileURLToPath(new URL('./types', import.meta.url)),
      fileURLToPath(new URL('./shared', import.meta.url)),
      fileURLToPath(new URL('./app/composables', import.meta.url))
    ],
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
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://www.gstatic.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com', 'https://fonts.googleapis.com'],
        'img-src': ["'self'", 'data:', 'https:'],
        'connect-src': ["'self'"],
      }
    },
    // Add route rules to bypass security features that consume the request body for uploads
    requestSizeLimiter: {
      throwError: true,
    },
    rateLimiter: false, // Disable rate limiter for now if needed, or configure
  },

  routeRules: {
    '/api/upload': {
      security: {
        requestSizeLimiter: false,
        xssValidator: false,
      },
    },
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
    componentDir: "~/components/ui",
  },
});
