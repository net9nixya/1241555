"use client";

import { Trophy, ListChecks, Play, ShoppingBag, UserRound } from "lucide-react";

export type Tab = "top" | "quests" | "play" | "shop" | "profile";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "top", label: "Топ", icon: <Trophy size={20} /> },
  { id: "quests", label: "Задания", icon: <ListChecks size={20} /> },
  { id: "play", label: "Играть", icon: <Play size={20} /> },
  { id: "shop", label: "Магазин", icon: <ShoppingBag size={20} /> },
  { id: "profile", label: "Профиль", icon: <UserRound size={20} /> },
];

export default function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="tabbar" aria-label="Основная навигация">
      <div className="tabbar-inner">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab-btn ${active === t.id ? "active" : ""}`}
            onClick={() => onChange(t.id)}
            aria-current={active === t.id ? "page" : undefined}
          >
            <span className="tab-btn-indicator" />
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
