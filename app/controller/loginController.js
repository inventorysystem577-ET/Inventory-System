import { supabase } from "../../lib/supabaseClient";

const APPROVED_USERS_TABLE = "user_profiles";

const normalizeStatus = (status, fallback = "approved") => {
  if (!status) return fallback;
  const normalized = String(status).toLowerCase();
  if (normalized === "approved" || normalized === "denied" || normalized === "pending") {
    return normalized;
  }
  return fallback;
};

const mapRowToStatus = (row) => {
  if (!row) return "pending";
  if (row.is_approved) return "approved";
  if (row.rejected_at) return "denied";
  return "pending";
};

const getApprovalStatusByUserId = async (userId) => {
  const { data, error } = await supabase
    .from(APPROVED_USERS_TABLE)
    .select("is_approved, rejected_at")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return "pending"; // ← no profile row = pending, never auto-approve
  return mapRowToStatus(data);
};

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

  const { data: profileRole } = await supabase
    .from(APPROVED_USERS_TABLE)
    .select("role")
    .eq("id", data?.user?.id)
    .maybeSingle();

const status = await getApprovalStatusByUserId(data?.user?.id);


  // Short-circuit: never lock out an admin even if their status is unset or mangled
  if (data?.user?.user_metadata?.role === "admin" || String(profileRole?.role || "").toLowerCase() === "admin") {
    return data;
  }

  if (status !== "approved") {
    await supabase.auth.signOut();
    if (status === "denied") {
      throw new Error("Your registration was denied by admin.");
    }
    throw new Error("Your account is pending admin approval.");
  }

  return data;
};
