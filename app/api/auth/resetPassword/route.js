// app/api/auth/resetPassword/route.js
import { NextResponse } from "next/server";
import { updatePassword } from "../../../models/authModel";

export async function POST(request) {
  try {
    const body = await request.json();
    const { password } = body;

    const data = await updatePassword(password);

    return NextResponse.json({ message: "Password updated successfully", data });
  } catch (error) {
    return NextResponse.json({ message: error.message || "Server error" }, { status: 400 });
  }
}
