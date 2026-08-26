import { NextRequest, NextResponse } from "next/server";
import { demoProfile, topBoards } from "../../../lib/demo";

export async function GET(req: NextRequest, { params }: { params: { nickname: string } }) {
  const base = process.env.COUNTER_FACEIT_API_URL;
  const secret = process.env.COUNTER_FACEIT_API_SECRET;
  const initData = req.headers.get("x-telegram-init-data") || "";
  // Параметр может быть как ником, так и игровым ID — это одна и та же
  // строка поиска, отправляем как есть, бэкенд бота сам решает, что искать
  // (см. webapp_api.py: /profile/{query} должен уметь искать по обоим полям).
  const query = decodeURIComponent(params.nickname);

  if (base) {
    const r = await fetch(`${base}/profile/${encodeURIComponent(query)}`, {
      headers: {
        "X-Telegram-Init-Data": initData,
        Authorization: secret ? `Bearer ${secret}` : "",
      },
      cache: "no-store",
    });
    if (r.status === 404) return NextResponse.json({ error: "Игрок не найден" }, { status: 404 });
    if (!r.ok) return NextResponse.json({ error: "Profile API error" }, { status: 502 });
    return NextResponse.json(await r.json());
  }

  // demo fallback: ищем совпадение по нику ИЛИ по игровому ID среди demo-данных,
  // чтобы поиск в мини-аппе можно было проверить визуально без реального бэкенда.
  const q = query.toLowerCase();
  if (q === demoProfile.nickname.toLowerCase() || q === demoProfile.gameId.toLowerCase()) {
    return NextResponse.json(demoProfile);
  }
  const foundEntry = topBoards.flatMap((b) => b.entries).find((e) => e.nickname.toLowerCase() === q);
  if (!foundEntry) return NextResponse.json({ error: "Игрок не найден" }, { status: 404 });

  return NextResponse.json({
    ...demoProfile,
    nickname: foundEntry.nickname,
    username: foundEntry.nickname,
    verified: foundEntry.verified,
    frameKey: null,
    badges: [],
    medals: [],
    matches: [],
  });
}
