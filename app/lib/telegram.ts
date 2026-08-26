export function getTelegramInitData() {
  if (typeof window === "undefined") return "";
  const w = window as any;
  return w.Telegram?.WebApp?.initData || "";
}

export function getTelegramUser() {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.Telegram?.WebApp?.initDataUnsafe?.user || null;
}
