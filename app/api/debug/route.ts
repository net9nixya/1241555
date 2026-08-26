import { NextResponse } from "next/server";

// Диагностика подключения к бэкенду бота — открой /api/debug в браузере
// (или нажми "Диагностика" в настройках мини-аппа), чтобы увидеть, на каком
// именно шаге теряется запрос: сама переменная не задана, сервер бота не
// отвечает, или конкретный роут (например /settings/promocode) не найден.
export async function GET() {
  const base = process.env.COUNTER_FACEIT_API_URL;
  const hasSecret = !!process.env.COUNTER_FACEIT_API_SECRET;

  if (!base) {
    return NextResponse.json({
      configured: false,
      message: "COUNTER_FACEIT_API_URL не задан в Environment Variables на Vercel",
    });
  }

  let baseHost = "";
  try {
    baseHost = new URL(base).host;
  } catch {
    baseHost = "⚠️ COUNTER_FACEIT_API_URL — не похож на валидный URL";
  }

  async function probe(path: string, method: "GET" | "POST" = "GET") {
    try {
      const r = await fetch(`${base}${path}`, {
        method,
        headers: method === "POST" ? { "Content-Type": "application/json" } : undefined,
        body: method === "POST" ? "{}" : undefined,
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      const text = await r.text().catch(() => "");
      return { status: r.status, ok: r.ok, bodyPreview: text.slice(0, 140) };
    } catch (e: any) {
      return { status: null, ok: false, error: e?.message || String(e) };
    }
  }

  const [health, profileNoAuth, settingsNoAuth] = await Promise.all([
    probe("/health"),
    probe("/profile"),
    probe("/settings/promocode", "POST"),
  ]);

  return NextResponse.json({
    configured: true,
    baseHost,
    hasSecret,
    checks: {
      health: {
        ...health,
        expect: "status 200 с {ok:true} — если тут status:null или сетевая ошибка, сервер бота недоступен / прокси не настроен",
      },
      profileNoAuth: {
        ...profileNoAuth,
        expect: "status 401 (нет initData) — если 404, весь /api/miniapp не проксируется",
      },
      settingsNoAuth: {
        ...settingsNoAuth,
        expect: "status 401 или 422 — если 404, именно /settings/* роут не найден на сервере (старый webapp_api.py ещё не подхватился, или прокси режет POST/эту конкретную ветку пути)",
      },
    },
  });
}
