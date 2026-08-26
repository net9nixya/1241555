"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { getTelegramInitData } from "../lib/telegram";
import { topBoards as demoTopBoards, TopBoard } from "../lib/demo";
import TooltipWrap from "./Tooltip";

const BOARD_TABS: { id: string; label: string }[] = [
  { id: "elo", label: "По Эло" },
  { id: "kd", label: "По КД" },
  { id: "wins", label: "По победам" },
];

export default function TopScreen({
  selfNickname,
  onSelectPlayer,
}: {
  selfNickname: string;
  onSelectPlayer: (nickname: string) => void;
}) {
  const [activeBoard, setActiveBoard] = useState("elo");
  const [board, setBoard] = useState<TopBoard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/top?board=${activeBoard}`, {
      headers: { "X-Telegram-Init-Data": getTelegramInitData() },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setBoard)
      .catch(() => setBoard(demoTopBoards.find((b) => b.id === activeBoard) ?? demoTopBoards[0]))
      .finally(() => setLoading(false));
  }, [activeBoard]);

  return (
    <>
      <h1 className="brand-title reveal">Топ игроков</h1>

      <div className="top-tabs reveal" style={{ animationDelay: "0.04s" }}>
        {BOARD_TABS.map((b) => (
          <button
            key={b.id}
            type="button"
            className={`top-tab ${b.id === activeBoard ? "active" : ""}`}
            onClick={() => setActiveBoard(b.id)}
          >
            {b.label}
          </button>
        ))}
      </div>

      <section className="card top-list reveal" style={{ animationDelay: "0.08s" }}>
        {loading || !board ? (
          <div className="empty-hint" style={{ padding: "14px 0" }}>
            Загрузка…
          </div>
        ) : board.entries.length === 0 ? (
          <div className="empty-hint" style={{ padding: "14px 0" }}>
            Пока никто не попал в этот топ.
          </div>
        ) : (
          board.entries.map((entry, i) => {
            const place = i + 1;
            const rankClass = place === 1 ? "gold" : place === 2 ? "silver" : place === 3 ? "bronze" : "";
            const isSelf = entry.nickname.toLowerCase() === selfNickname.toLowerCase();
            return (
              <button
                type="button"
                className="top-row top-row-clickable"
                key={entry.nickname}
                onClick={() => onSelectPlayer(entry.nickname)}
              >
                <span className={`top-rank ${rankClass}`}>{place}</span>
                <span className={`top-name ${isSelf ? "self" : ""}`}>{entry.nickname}</span>
                {entry.verified && (
                  <TooltipWrap description="Данный игрок верифицирован.">
                    <ShieldCheck size={13} style={{ flexShrink: 0, color: "var(--accent)" }} />
                  </TooltipWrap>
                )}
                <span className="top-value tabular">{entry.value}</span>
              </button>
            );
          })
        )}
      </section>

      <div className="footer reveal" style={{ animationDelay: "0.12s" }}>
        Нажми на игрока, чтобы открыть его профиль
      </div>
    </>
  );
}
