import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createMockSupabaseClient } from "@lib/supabase.mock";

let cachedClient: SupabaseClient | null = null;

export function getAdminDbClient(): SupabaseClient {
  if (process.env.NODE_ENV === "test") {
    return createMockSupabaseClient() as unknown as SupabaseClient;
  }

  if (cachedClient) {
    return cachedClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("server_misconfigured: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridos");
  }

  cachedClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return cachedClient;
}
