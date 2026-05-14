import { fileURLToPath } from 'node:url'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  devServer: {
    host: '0.0.0.0', // Listen on all interfaces (IPv4 + IPv6)
    port: 3000,
  },

  modules: ["@nuxtjs/tailwindcss", "shadcn-nuxt", "nuxt-security"],

  css: ['~/assets/css/tailwind.css'],

  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    exposeConfig: true,
    viewer: true,
  },
// Runtime configuration
runtimeConfig: {
  // Private keys (Server only)
  zaiApiKey: '',
  zaiApiBase: '',
  openrouterApiKey: '',
  openrouterApiBase: '',
  fallbackModel: '',
  databasePath: '',
  sessionSecret: '',

  // Public keys (Exposed to client)
  public: {
    appUrl: '',
    primaryModel: '',
    primaryModelDisplayName: '',
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
    // CORS configuration
    cors: {
      // Allow origins (from env or default to localhost)
      origin: process.env.CORS_ORIGINS?.split(','),
      // Allow credentials (cookies, authorization headers)
      credentials: true,
      // Allowed methods
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      // Allowed headers
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Token', 'x-chat-session-id'],
      // Exposed headers (client can read)
      exposedHeaders: ['Content-Length', 'Content-Type', 'X-Chat-Session-Id'],
      // Cache preflight response (seconds)
      maxAge: 86400, // 24 hours
    },
    // Enable security headers
    headers: {
      xFrameOptions: 'DENY', // Prevent clickjacking
      xContentTypeOptions: 'nosniff', // Prevent MIME sniffing
      xXSSProtection: '1; mode=block', // XSS protection
      referrerPolicy: 'no-referrer', // No referrer policy
      contentSecurityPolicy: {
        // CSP for basic protection
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'", "blob:"],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://www.gstatic.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com', 'https://fonts.googleapis.com'],
        'img-src': ["'self'", 'data:', 'https:'],
        'connect-src': ["'self'", 'https://api.z.ai', 'https://api.openrouter.ai'],
        'worker-src': ["'self'", "blob:"],
      }
    },
    // Add route rules to bypass security features that consume the request body for uploads
    requestSizeLimiter: {
      throwError: true,
    },
    rateLimiter: false, // Disabled globally, can be enabled on specific routes
  },

  routeRules: {
    '/api/upload': {
      security: {
        requestSizeLimiter: false,
        xssValidator: false,
      },
    },
    '/api/auth/login': {
      security: {
        rateLimiter: {
          tokensPerInterval: 10,
          interval: 'minute',
          driver: { name: 'memory' }
        }
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
    componentDir: "~/components/ui",
  },
});
