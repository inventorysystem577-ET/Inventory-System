import { supabase } from "../../lib/supabaseClient";

/**
 * Client-side controller: perform sign in with client Supabase so session is persisted in browser.
 */
export const handleSubmitLogin = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Email and Password are required");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);
  return data;
};
