import {
  createClient,
  type SupabaseClient,
} from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl =
    import.meta.env.VITE_SUPABASE_URL;

  const supabasePublishableKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      'VITE_SUPABASE_URL não está configurada.',
    );
  }

  if (!supabasePublishableKey) {
    throw new Error(
      'VITE_SUPABASE_PUBLISHABLE_KEY não está configurada.',
    );
  }

  supabaseClient = createClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    },
  );

  return supabaseClient;
}