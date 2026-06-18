import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
    storageKey: "supabase.auth.token",
  },
  global: {
    headers: {
      "x-client-info": "supabase-js/web",
    },
  },
});

// Refresh session token before it expires (every 50 minutes)
if (typeof window !== "undefined") {
  setInterval(async () => {
    try {
      const { data: { session } } = await supabase.auth.refreshSession();
      if (session) {
        console.log("Session refreshed successfully");
      }
    } catch (error) {
      console.warn("Failed to refresh session:", error.message);
    }
  }, 50 * 60 * 1000); // 50 minutes
}