import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null

export const useSupabase = () => {
  const config = useRuntimeConfig()
  const url = config.public.supabaseUrl || process.env.NUXT_PUBLIC_SUPABASE_URL
  const anonKey =
    config.public.supabaseAnonKey || process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase config. Set NUXT_PUBLIC_SUPABASE_URL and NUXT_PUBLIC_SUPABASE_ANON_KEY.'
    )
  }

  if (!supabaseClient) {
    supabaseClient = createClient(url, anonKey)
  }

  return supabaseClient
}
