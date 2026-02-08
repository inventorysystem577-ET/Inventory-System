import { login } from "../../../models/authModel";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response("Missing email or password", { status: 400 });
    }

    const data = await login({ email, password });

    return new Response(
      JSON.stringify({
        message: "Login Successful",
        user: data.user,
        session: data.session,
      }),
    );
  } catch (error) {
    return new Response(error.message || "Server error", { status: 500 });
  }
}
