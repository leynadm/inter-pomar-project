import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = formData.get("password") as string;

  if (password === process.env.VESTIDOR_PASSWORD) {
    const response = NextResponse.redirect(
      new URL("/vestidor", request.url)
    );
    response.cookies.set("vestidor-auth", password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    return response;
  }

  // Wrong password — redirect back
  return NextResponse.redirect(new URL("/vestidor", request.url));
}
