"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X, ShieldCheck } from "lucide-react";
import { getTelegramInitData } from "../lib/telegram";
import type { Profile } from "../lib/types";

// Небольшой тип для одной строки результата поиска — используем сам Profile,
// т.к. /api/profile/[nickname] отдаёт полный профиль, но показываем только
// самое важное (ник, ELO, verified), полный профиль открывается по клику.
type SearchHit = Pick<Profile, "nickname" | "gameId" | "avatarUrl" | "elo" | "verified">;

export default function SearchOverlay({
  onClose,
  onOpenProfile,
}: {
  onClose: () => void;
  onOpenProfile: (nickname: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "found" | "empty" | "error">("idle");
  const [hit, setHit] = useState<SearchHit | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Автофокус при открытии — приятнее сразу начать печатать.
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (!q) {
      setStatus("idle");
      setHit(null);
      return;
    }
    setStatus("loading");
    debounceRef.current = setTimeout(() => {
      fetch(`/api/profile/${encodeURIComponent(q)}`, {
        headers: { "X-Telegram-Init-Data": getTelegramInitData() },
      })
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((p: Profile) => {
          setHit(p);
          setStatus("found");
        })
        .catch(() => {
          setHit(null);
          setStatus("empty");
        });
    }, 380);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handleSelect() {
    if (!hit) return;
    // Небольшая задержка перед переключением экрана — даёт анимации карточки
    // доиграть, вместо резкого "прыжка" в профиль.
    onOpenProfile(hit.nickname);
    setTimeout(onClose, 40);
  }

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-panel" onClick={(e) => e.stopPropagation()}>
        <div className="search-bar-row">
          <div className="search-input-wrap">
            <Search size={17} />
            <input
              ref={inputRef}
              className="search-input"
              placeholder="Игровой ID или ник игрока…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && hit) handleSelect();
                if (e.key === "Escape") onClose();
              }}
            />
          </div>
          <button type="button" className="search-close" onClick={onClose} aria-label="Закрыть поиск">
            <X size={18} />
          </button>
        </div>

        <div className="search-hint">Найди любого игрока по игровому ID или никнейму</div>

        <div className="search-results">
          {status === "idle" && <div className="search-state">Начни вводить, чтобы найти игрока</div>}
          {status === "loading" && <div className="search-state">Ищем…</div>}
          {status === "empty" && <div className="search-state">Никого не нашли по «{query}»</div>}
          {status === "found" && hit && (
            <button type="button" className="search-result-row" onClick={handleSelect}>
              <span className="search-result-avatar">
                {hit.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={hit.avatarUrl} alt={hit.nickname} />
                ) : (
                  hit.nickname.slice(0, 2).toUpperCase()
                )}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="search-result-name">
                  {hit.nickname}
                  {hit.verified && <ShieldCheck size={13} style={{ color: "var(--accent)", flexShrink: 0 }} />}
                </span>
                <span className="search-result-sub">
                  {hit.gameId} · {hit.elo} ELO
                </span>
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
