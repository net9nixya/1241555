import { NextRequest, NextResponse } from "next/server";
import { topBoards } from "../../lib/demo";

export async function GET(req: NextRequest) {
  const base = process.env.COUNTER_FACEIT_API_URL;
  const secret = process.env.COUNTER_FACEIT_API_SECRET;
  const initData = req.headers.get("x-telegram-init-data") || "";
  const board = req.nextUrl.searchParams.get("board") || "elo";

  if (base) {
    const r = await fetch(`${base}/top?board=${encodeURIComponent(board)}`, {
      headers: {
        "X-Telegram-Init-Data": initData,
        Authorization: secret ? `Bearer ${secret}` : "",
      },
      cache: "no-store",
    });
    if (!r.ok) return NextResponse.json({ error: "Top API error" }, { status: 502 });
    return NextResponse.json(await r.json());
  }

  const found = topBoards.find((b) => b.id === board) || topBoards[0];
  return NextResponse.json(found);
}
