import { NextRequest, NextResponse } from "next/server";

// POST { itemId: string } — покупка товара в магазине мини-аппа за Counter
// Coin (VIP, Разбан, рамки frame_void/frame_cyber). Цены проверяются на
// сервере бота (db.SHOP_PRICES в database.py), этот роут просто
// пробрасывает запрос — как и все остальные /api/settings/*.
export async function POST(req: NextRequest) {
  const base = process.env.COUNTER_FACEIT_API_URL;
  const secret = process.env.COUNTER_FACEIT_API_SECRET;
  const initData = req.headers.get("x-telegram-init-data") || "";
  const body = await req.json().catch(() => ({}));

  if (!base) {
    return NextResponse.json({ error: "Бэкенд не подключён (нет COUNTER_FACEIT_API_URL)" }, { status: 503 });
  }

  const r = await fetch(`${base}/shop/buy`, {
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
