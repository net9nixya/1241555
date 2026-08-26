"use client";

import { useEffect, useState } from "react";
import { Clock3, ArrowLeft, Search, Settings, LifeBuoy } from "lucide-react";
import { getTelegramInitData } from "./lib/telegram";
import type { Profile } from "./lib/types";
import { demoProfile } from "./lib/demo";
import TabBar, { Tab } from "./components/TabBar";
import ProfileScreen from "./components/ProfileScreen";
import TopScreen from "./components/TopScreen";
import QuestsScreen from "./components/QuestsScreen";
import ShopScreen from "./components/ShopScreen";
import PlayScreen from "./components/PlayScreen";
import SearchOverlay from "./components/SearchOverlay";
import RegisterGate from "./components/RegisterGate";
import SettingsPanel from "./components/SettingsPanel";

// Раскомментируй / поставь false, чтобы полностью отключить экран
// "зарегистрируйся" и всегда показывать demo-профиль, если бэкенд
// недоступен (удобно для локальной разработки без COUNTER_FACEIT_API_URL).
const SHOW_REGISTER_GATE = true;

// Ссылка на чат поддержки — по умолчанию тот же бот, что и для регистрации
// (см. RegisterGate.tsx), если нужен отдельный аккаунт поддержки — задай
// NEXT_PUBLIC_SUPPORT_LINK в Environment Variables на Vercel.
const SUPPORT_LINK = process.env.NEXT_PUBLIC_SUPPORT_LINK || "https://t.me/Counterfaceit_bot";

export default function Home() {
  const [p, setP] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notRegistered, setNotRegistered] = useState(false);
  const [tab, setTab] = useState<Tab>("profile");
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Когда не null — поверх текущей вкладки показываем чужой профиль
  // (открытый кликом по строке в топе или через поиск), а не переключаем
  // саму вкладку.
  const [viewedNickname, setViewedNickname] = useState<string | null>(null);
  const [viewedProfile, setViewedProfile] = useState<Profile | null>(null);
  const [viewedLoading, setViewedLoading] = useState(false);
  const [viewedError, setViewedError] = useState("");

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    tg?.ready();
    tg?.expand();

    fetch("/api/profile", { headers: { "X-Telegram-Init-Data": getTelegramInitData() } })
      .then(async (r) => {
        if (r.status === 404) {
          // Бэкенд явно говорит: такого игрока нет — значит человек открыл
          // мини-апп, не пройдя регистрацию в боте.
          setNotRegistered(true);
          return null;
        }
        if (r.ok) return r.json();
        const body = await r.text().catch(() => "");
        throw new Error(`HTTP ${r.status}: ${body}`);
      })
      .then((data) => {
        if (data) setP(data);
      })
      .catch((e) => {
        // Сетевая/серверная ошибка (не "не зарегистрирован") — например,
        // локальная разработка без бэкенда. Показываем demo-профиль, чтобы
        // не блокировать проверку интерфейса.
        setP(demoProfile);
        setError(`Демо-профиль (ошибка API: ${e.message || e})`);
      })
      .finally(() => setLoading(false));
  }, []);

  function openPlayerProfile(nickname: string) {
    setViewedNickname(nickname);
    setViewedProfile(null);
    setViewedError("");
    setViewedLoading(true);
    fetch(`/api/profile/${encodeURIComponent(nickname)}`, {
      headers: { "X-Telegram-Init-Data": getTelegramInitData() },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setViewedProfile)
      .catch(() => setViewedError("Не удалось загрузить профиль этого игрока."))
      .finally(() => setViewedLoading(false));
  }

  function closePlayerProfile() {
    setViewedNickname(null);
    setViewedProfile(null);
    setViewedError("");
  }

  if (loading) return <LoadingShell />;

  if (notRegistered && SHOW_REGISTER_GATE) {
    return <RegisterGate />;
  }

  const x = p!;

  return (
    <main className="cf-shell">
      <div className="cf-bg-extra" />
      <div className="cf-wrap">
        {viewedNickname ? (
          <>
            <button type="button" className="back-btn reveal" onClick={closePlayerProfile}>
              <ArrowLeft size={15} />
              Назад
            </button>
            {viewedLoading && (
              <div className="card hero skeleton" style={{ height: 132 }} />
            )}
            {viewedError && (
              <div className="notice-pill reveal">
                <Clock3 size={14} />
                {viewedError}
              </div>
            )}
            {viewedProfile && <ProfileScreen profile={viewedProfile} />}
          </>
        ) : (
          <>
            <div className="header-row">
              {tab === "profile" ? (
                <>
                  <button
                    type="button"
                    className="icon-fab reveal"
                    onClick={() => setSettingsOpen(true)}
                    aria-label="Настройки профиля"
                  >
                    <Settings size={18} />
                  </button>
                  <a
                    href={SUPPORT_LINK}
                    target="_blank"
                    rel="noreferrer"
                    className="icon-fab reveal"
                    style={{ animationDelay: "0.03s" }}
                    aria-label="Поддержка"
                  >
                    <LifeBuoy size={18} />
                  </a>
                  <span className="header-title reveal" style={{ animationDelay: "0.06s" }}>
                    Профиль
                  </span>
                </>
              ) : (
                <span className="icon-fab-spacer" aria-hidden="true" />
              )}
              <button
                type="button"
                className="icon-fab reveal"
                onClick={() => setSearchOpen(true)}
                aria-label="Найти игрока"
              >
                <Search size={18} />
              </button>
            </div>

            {error && tab === "profile" && (
              <div className="notice-pill reveal">
                <Clock3 size={14} />
                {error}
              </div>
            )}

            {tab === "profile" && <ProfileScreen profile={x} />}
            {tab === "top" && <TopScreen selfNickname={x.nickname} onSelectPlayer={openPlayerProfile} />}
            {tab === "quests" && <QuestsScreen />}
            {tab === "shop" && <ShopScreen />}
            {tab === "play" && <PlayScreen />}
          </>
        )}

        <div className="tabbar-spacer" />
      </div>

      <TabBar active={tab} onChange={setTab} />

      {searchOpen && (
        <SearchOverlay
          onClose={() => setSearchOpen(false)}
          onOpenProfile={(nickname) => {
            openPlayerProfile(nickname);
          }}
        />
      )}

      {settingsOpen && (
        <SettingsPanel
          profile={x}
          onClose={() => setSettingsOpen(false)}
          onProfileUpdated={(updated) => setP(updated)}
        />
      )}
    </main>
  );
}

function LoadingShell() {
  return (
    <main className="cf-shell">
      <div className="cf-wrap">
        <div className="card hero skeleton" style={{ height: 132 }} />
        <div className="section-title" style={{ opacity: 0.4 }}>
          Рейтинг
        </div>
        <div className="card skeleton" style={{ height: 96 }} />
        <div className="section-title" style={{ opacity: 0.4 }}>
          Статистика
        </div>
        <div className="stat-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="card skeleton" key={i} style={{ height: 96 }} />
          ))}
        </div>
      </div>
    </main>
  );
}
