type SoriUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, string | boolean | undefined>;
};
type AuthResult = Promise<{ error: Error | null }>;
type SoriSupabaseClient = {
  auth: {
    signUp: (args: {
      email: string;
      password: string;
      options?: {
        emailRedirectTo?: string;
        data?: Record<string, string>;
      };
    }) => Promise<{ data?: { user?: SoriUser | null }; error: Error | null }>;
    signInWithPassword: (args: { email: string; password: string }) => Promise<{ data?: { user?: SoriUser | null }; error: Error | null }>;
    getUser: () => Promise<{ data?: { user?: SoriUser | null }; error: Error | null }>;
    updateUser: (args: { data?: Record<string, string | boolean> }) => Promise<{ data?: { user?: SoriUser | null }; error: Error | null }>;
  };
};

declare function require(moduleName: string): {
  createClient: (url: string, key: string, options: Record<string, unknown>) => SoriSupabaseClient;
};

const { createClient } = require('@supabase/supabase-js/dist/index.cjs');

let client: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase keys. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env.local.');
  }

  client ??= createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

  return client;
}
