import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client with the service role key.
 * This client bypasses Row Level Security (RLS).
 *
 * ⚠️  ONLY use in:
 *   - Webhook route handlers (Stripe, Mux)
 *   - Server-side admin operations
 *   - Background jobs
 *
 * NEVER expose this to Client Components.
 */
export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
}
