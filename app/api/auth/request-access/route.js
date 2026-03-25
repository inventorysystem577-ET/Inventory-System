import { supabase } from "../../../../lib/supabaseClient";

const REQUESTS_TABLE = "access_requests_temp";
const PROFILES_TABLE = "user_profiles";

const normalizeEmail = (value = "") => String(value).trim().toLowerCase();

const buildStatusResponse = ({
  status,
  message,
  registerUrl = null,
  request = null,
}) => ({
  status,
  message,
  registerUrl,
  request,
});

const getStatusByEmail = async (email) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    throw new Error("Email is required");
  }

  const { data: approvedProfile } = await supabase
    .from(PROFILES_TABLE)
    .select("id, email, is_approved")
    .eq("email", normalizedEmail)
    .eq("is_approved", true)
    .maybeSingle();

  if (approvedProfile) {
    return buildStatusResponse({
      status: "already_registered",
      message: "This email already has system access. Please sign in.",
    });
  }

  const { data: accessRequest } = await supabase
    .from(REQUESTS_TABLE)
    .select("id, email, reason, is_approved, approved_at, rejected_at")
    .eq("email", normalizedEmail)
    .order("requested_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!accessRequest) {
    return buildStatusResponse({
      status: "not_found",
      message: "No access request found for this email.",
    });
  }

  if (accessRequest.rejected_at) {
    return buildStatusResponse({
      status: "denied",
      message: "Your access request was denied. Please contact an administrator.",
      request: accessRequest,
    });
  }

  if (accessRequest.is_approved) {
    return buildStatusResponse({
      status: "approved_for_registration",
      message:
        "Your access request was approved. Continue to registration to complete your account.",
      registerUrl: `/view/register?email=${encodeURIComponent(normalizedEmail)}`,
      request: accessRequest,
    });
  }

  return buildStatusResponse({
    status: "pending",
    message:
      "Admin has been notified. Please wait for approval and try again later.",
    request: accessRequest,
  });
};

export async function POST(req) {
  try {
    const body = await req.json();
    const email = normalizeEmail(body?.email);
    const reason = String(body?.reason || "").trim();

    if (!email) {
      return new Response(JSON.stringify({ message: "Email is required" }), {
        status: 400,
      });
    }

    const existingStatus = await getStatusByEmail(email);

    if (existingStatus.status !== "not_found") {
      return new Response(JSON.stringify(existingStatus), { status: 200 });
    }

    const insertPayload = {
      email,
      name: email,
      role: "staff",
      reason: reason || "No reason provided",
      is_approved: false,
      requested_at: new Date().toISOString(),
      approved_at: null,
      approved_by: null,
      rejected_at: null,
      rejected_by: null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from(REQUESTS_TABLE)
      .insert(insertPayload)
      .select("id, email, reason, is_approved, requested_at")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return new Response(
      JSON.stringify(
        buildStatusResponse({
          status: "requested",
          message:
            "Admin has been notified. Please wait for approval and try again later.",
          request: data,
        }),
      ),
      { status: 201 },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: error.message || "Server error" }),
      { status: 400 },
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = normalizeEmail(searchParams.get("email") || "");
    const status = String(searchParams.get("status") || "").toLowerCase();

    if (email) {
      const statusData = await getStatusByEmail(email);
      return new Response(JSON.stringify(statusData), { status: 200 });
    }

    let query = supabase
      .from(REQUESTS_TABLE)
      .select("id, name, email, role, reason, is_approved, requested_at, approved_at, rejected_at")
      .order("requested_at", { ascending: false });

    if (status === "pending") {
      query = query.eq("is_approved", false).is("rejected_at", null);
    } else if (status === "approved") {
      query = query.eq("is_approved", true);
    } else if (status === "denied") {
      query = query.not("rejected_at", "is", null);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return new Response(JSON.stringify({ requests: data || [] }), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: error.message || "Server error" }),
      { status: 400 },
    );
  }
}
