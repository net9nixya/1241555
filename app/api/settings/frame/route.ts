import { NextRequest, NextResponse } from "next/server";

// POST { frameKey: string | null } — надеть рамку из своего инвентаря
// (frameKey) или снять текущую (null). Купить рамку — через /api/shop/buy,
// этот роут только переключает, какая из УЖЕ имеющихся рамок надета.
export async function POST(req: NextRequest) {
  const base = process.env.COUNTER_FACEIT_API_URL;
  const secret = process.env.COUNTER_FACEIT_API_SECRET;
  const initData = req.headers.get("x-telegram-init-data") || "";
  const body = await req.json().catch(() => ({}));

  if (!base) {
    return NextResponse.json({ error: "Бэкенд не подключён (нет COUNTER_FACEIT_API_URL)" }, { status: 503 });
  }

  const r = await fetch(`${base}/settings/frame`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Telegram-Init-Data": initData,
      Authorization: secret ? `Bearer ${secret}` : "",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) return NextResponse.json({ error: data?.detail || "Ошибка" }, { status: r.status });
  return NextResponse.json(data);
}
