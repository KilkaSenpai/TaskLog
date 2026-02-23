// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    baseURL: process.env.NODE_ENV === 'production' ? '/TaskLog/' : '/',
    head: {
      link: [
        {
          rel: 'icon',
          type: 'image/svg+xml',
          href: (process.env.NODE_ENV === 'production' ? '/TaskLog/' : '/') + 'favicon.svg'
        }
      ]
    }
  },
  vite: {
    plugins: [tailwindcss()],
    base: process.env.NODE_ENV === 'production' ? '/TaskLog/' : '/'
  },
  css: ['@/assets/main.css', '@fancyapps/ui/dist/fancybox/fancybox.css'],
  postcss: {
    plugins: {
      '@tailwindcss/postcss': {}
    }
  },
  runtimeConfig: {
    groqApiKey: process.env.GROQ_API_KEY || process.env.NUXT_GROQ_API_KEY || '',
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || '',
      /** Canonical site origin (e.g. https://example.com). If unset, request origin is used. */
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || ''
    }
  },
  routeRules: {
    '/': { ssr: false },
    '/auth/callback': { ssr: false },
    '/skills/**': { ssr: false }
  }
})
