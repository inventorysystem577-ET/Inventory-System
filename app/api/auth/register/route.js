import { registerUser } from "../../../models/authModel";

export async function POST(req) {
  try {
    const { name, email, password, role } = await req.json();

    const data = await registerUser({ name, email, password, role });

    return new Response(
      JSON.stringify({ message: "Account Created", user: data.user }),
      { status: 201 },
    );
  } catch (error) {
    return new Response(error.message || "Server error", { status: 400 });
  }
}
