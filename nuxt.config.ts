// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@nuxtjs/tailwindcss", "shadcn-nuxt"],

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
    typeCheck: true, // Enable type checking in development
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
    componentDir: "@/components/ui",
  },
});
