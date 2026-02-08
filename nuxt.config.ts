// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['@/assets/main.css', '@fancyapps/ui/dist/fancybox/fancybox.css'],
  postcss: {
    plugins: {
      '@tailwindcss/postcss': {}
    }
  },
  vite: {
    plugins: [tailwindcss()]
  },
  experimental: {
    inlineSSRStyles: true
  },
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || ''
    }
  }
})
