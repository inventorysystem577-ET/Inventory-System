import { NextResponse } from "next/server";
import { sendResetEmail } from "../../../models/authModel";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = body?.email;

    const data = await sendResetEmail(email);

    return NextResponse.json({
      message: "Password reset link sent! Check your email",
      data,
    });
  } catch (error) {
    return NextResponse.json({ message: error.message || "Server error" }, { status: 400 });
  }
}
