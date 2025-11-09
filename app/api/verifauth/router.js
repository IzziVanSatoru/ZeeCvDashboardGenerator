import { NextResponse } from "next/server";

export async function GET(req) {
  const cookie = req.headers.get("cookie") || "";
  const sessionExists = cookie.includes("session=true");

  if (!sessionExists) {
    return NextResponse.json({ auth: false }, { status: 401 });
  }

  return NextResponse.json({ auth: true });
}
