import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null

export const useSupabase = () => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/930a2aba-a5bc-4650-9e44-72eadb382033',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/composables/useSupabase.ts:6',message:'useSupabase entry',data:{hasConfig:true},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  const config = useRuntimeConfig()
  const url = config.public.supabaseUrl || process.env.NUXT_PUBLIC_SUPABASE_URL
  const anonKey =
    config.public.supabaseAnonKey || process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/930a2aba-a5bc-4650-9e44-72eadb382033',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/composables/useSupabase.ts:12',message:'missing supabase config',data:{hasUrl:!!url,hasAnonKey:!!anonKey,publicUrlLen:config.public.supabaseUrl?.length || 0,publicKeyLen:config.public.supabaseAnonKey?.length || 0,envUrlLen:(process.env.NUXT_PUBLIC_SUPABASE_URL || '').length,envKeyLen:(process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || '').length},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    throw new Error(
      'Missing Supabase config. Set NUXT_PUBLIC_SUPABASE_URL and NUXT_PUBLIC_SUPABASE_ANON_KEY.'
    )
  }

  if (!supabaseClient) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/930a2aba-a5bc-4650-9e44-72eadb382033',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/composables/useSupabase.ts:18',message:'create supabase client',data:{clientExists:!!supabaseClient,urlLen:url.length,anonKeyLen:anonKey.length},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H3'})}).catch(()=>{});
    // #endregion
    supabaseClient = createClient(url, anonKey)
  }

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/930a2aba-a5bc-4650-9e44-72eadb382033',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/composables/useSupabase.ts:22',message:'return supabase client',data:{clientExists:!!supabaseClient},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H4'})}).catch(()=>{});
  // #endregion
  return supabaseClient
}
