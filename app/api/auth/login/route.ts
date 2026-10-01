import { NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/cookies";
import { env } from "@/lib/env";

export const POST = async (req: Request) => {
  const body = await req.json();

  try {
    const res = await fetch(`${env.BACKEND_URL}/auth/admin/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { message: data?.message ?? "Failed to login" },
        { status: res.status },
      );
    }

    const data = await res.json();
    const access = data?.access;
    const refresh = data?.refresh;
    const mustChangePassword = data?.mustChangePassword;

    if (!(access && refresh)) {
      return NextResponse.json(
        { message: "Invalid login response" },
        { status: 500 },
      );
    }

    await setAuthCookies(access, 10 * 60 * 60, refresh, 60 * 60 * 24 * 30);

    return NextResponse.json({ ok: true, mustChangePassword });
  } catch {
    return NextResponse.json({ message: "Login error" }, { status: 500 });
  }
};
