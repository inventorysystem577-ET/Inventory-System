import { supabase } from "../../../../lib/supabaseClient";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!name || !normalizedEmail || !password) {
      throw new Error("Name, email, and password are required");
    }

    // Check approved request first (registration allowed only after approval)
    const { data: request, error: requestError } = await supabase
      .from("access_requests_temp")
      .select("id, email, role, reason, requested_at, is_approved, approved_at, approved_by, rejected_at")
      .eq("email", normalizedEmail)
      .order("requested_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (requestError) throw new Error(requestError.message);
    if (!request) {
      throw new Error("No approved access request found for this email.");
    }
    if (request.rejected_at) {
      throw new Error("Your access request was denied by admin.");
    }
    if (!request.is_approved) {
      throw new Error("Your access request is still pending admin approval.");
    }

    // Prevent duplicate completed accounts
    const { data: existingProfile } = await supabase
      .from("user_profiles")
      .select("id, email, is_approved")
      .eq("email", normalizedEmail)
      .eq("is_approved", true)
      .maybeSingle();

    if (existingProfile) {
      throw new Error("This email is already registered and approved.");
    }

    const resolvedRole = request.role || "staff";

    // Create auth account only after approval
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { name, role: resolvedRole, status: "approved" },
      },
    });

    if (authError) throw new Error(authError.message);

    const authUserId = authData.user?.id;
    if (!authUserId) throw new Error("Auth account creation failed — no user ID returned.");

    // Persist approved profile for system access
    const now = new Date().toISOString();
    const { error: profileError } = await supabase
      .from("user_profiles")
      .upsert({
        id: authUserId,
        name,
        email: normalizedEmail,
        role: resolvedRole,
        reason: request.reason || "",
        is_approved: true,
        requested_at: request.requested_at || now,
        approved_at: request.approved_at || now,
        approved_by: request.approved_by || "admin",
        rejected_at: null,
        rejected_by: null,
        updated_at: now,
      });

    if (profileError) {
      throw new Error(`Account created but profile save failed: ${profileError.message}`);
    }

    // Remove consumed approved request
    await supabase.from("access_requests_temp").delete().eq("id", request.id);

    return new Response(
      JSON.stringify({
        message: "Registration complete. Your account now has access.",
        user: authData.user,
      }),
      { status: 201 },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: error.message || "Server error" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
}