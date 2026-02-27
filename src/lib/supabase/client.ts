import { createBrowserClient } from '@supabase/ssr';

type AuthCallback = (event: string, session: unknown) => void;

type SupabaseAuthStub = {
  getSession: () => Promise<{ data: { session: null }; error: null }>;
  refreshSession: () => Promise<{ data: { session: null } }>;
  onAuthStateChange: (cb: AuthCallback) => { data: { subscription: { unsubscribe: () => void } } };
};

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Return a lightweight stub to avoid runtime errors when Supabase is not configured (local docs preview)
    // The stub implements the small subset of the auth API used by the frontend components.
    const stub: { auth: SupabaseAuthStub } = {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        refreshSession: async () => ({ data: { session: null } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
    };

    return stub as unknown as ReturnType<typeof createBrowserClient>;
  }

  return createBrowserClient(url, key);
}
