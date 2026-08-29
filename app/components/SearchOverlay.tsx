"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X, ShieldCheck, Code2, UserSearch, UserX, ChevronRight } from "lucide-react";
import { getTelegramInitData } from "../lib/telegram";
import type { Profile } from "../lib/types";

// Небольшой тип для одной строки результата поиска — используем сам Profile,
// т.к. /api/profile/[nickname] отдаёт полный профиль, но показываем только
// самое важное (ник, ELO, verified), полный профиль открывается по клику.
type SearchHit = Pick<Profile, "nickname" | "gameId" | "avatarUrl" | "elo" | "verified" | "devVerified">;

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

  function clearQuery() {
    setQuery("");
    inputRef.current?.focus();
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
            {query && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={clearQuery}
                aria-label="Очистить поле поиска"
              >
                <X size={13} />
              </button>
            )}
          </div>
          <button type="button" className="search-close" onClick={onClose} aria-label="Закрыть поиск">
            <X size={18} />
          </button>
        </div>

        <div className="search-hint">Найди любого игрока по игровому ID или никнейму</div>

        <div className="search-results">
          {status === "idle" && (
            <div className="search-state-card reveal">
              <div className="search-state-icon">
                <UserSearch size={22} />
              </div>
              <div className="search-state-title">Начни вводить</div>
              <p className="search-state-sub">Ищи по никнейму или игровому ID — результат появится сразу</p>
            </div>
          )}

          {status === "loading" && (
            <div className="search-skeleton-list" aria-live="polite" aria-label="Идёт поиск">
              <div className="search-skeleton-row">
                <span className="search-skeleton-avatar skeleton" />
                <span className="search-skeleton-lines">
                  <span className="search-skeleton-bar skeleton" style={{ width: "46%" }} />
                  <span className="search-skeleton-bar skeleton" style={{ width: "30%" }} />
                </span>
              </div>
              <div className="search-skeleton-row" style={{ opacity: 0.55 }}>
                <span className="search-skeleton-avatar skeleton" />
                <span className="search-skeleton-lines">
                  <span className="search-skeleton-bar skeleton" style={{ width: "38%" }} />
                  <span className="search-skeleton-bar skeleton" style={{ width: "24%" }} />
                </span>
              </div>
            </div>
          )}

          {status === "empty" && (
            <div className="search-state-card reveal">
              <div className="search-state-icon search-state-icon-muted">
                <UserX size={22} />
              </div>
              <div className="search-state-title">Никого не нашли</div>
              <p className="search-state-sub">
                По запросу «{query}» игроков не найдено — проверь написание
              </p>
            </div>
          )}

          {status === "found" && hit && (
            <button type="button" className="search-result-row reveal" onClick={handleSelect}>
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
                  {hit.devVerified && <Code2 size={13} style={{ color: "var(--accent)", flexShrink: 0 }} />}
                  {hit.verified && <ShieldCheck size={13} style={{ color: "var(--accent)", flexShrink: 0 }} />}
                </span>
                <span className="search-result-sub">
                  {hit.gameId} · {hit.elo} ELO
                </span>
              </span>
              <ChevronRight size={18} className="search-result-arrow" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
