import { NextRequest, NextResponse } from "next/server";
import { demoProfile } from "../../lib/demo";

export async function GET(req: NextRequest) {
  const base = process.env.COUNTER_FACEIT_API_URL;
  const secret = process.env.COUNTER_FACEIT_API_SECRET;
  const initData = req.headers.get("x-telegram-init-data") || "";

  if (base) {
    const r = await fetch(`${base}/profile`, {
      headers: {
        "X-Telegram-Init-Data": initData,
        Authorization: secret ? `Bearer ${secret}` : "",
      },
      cache: "no-store",
    });
    if (r.status === 404) {
      // Игрок открыл мини-апп, но не зарегистрирован в боте — прокидываем
      // 404 как есть, page.tsx покажет полноэкранный экран регистрации.
      return NextResponse.json({ error: "Не зарегистрирован" }, { status: 404 });
    }
    if (!r.ok) {
      const detail = await r.text().catch(() => "");
      return NextResponse.json({ error: "Profile API error", upstreamStatus: r.status, detail }, { status: r.status });
    }
    return NextResponse.json(await r.json());
  }

  return NextResponse.json(demoProfile);
}
