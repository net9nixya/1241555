"use client";

import { useState } from "react";
import { X, User, Hash, Ticket, Loader2, Stethoscope, ChevronDown } from "lucide-react";
import { getTelegramInitData } from "../lib/telegram";
import type { Profile } from "../lib/types";

type FieldState = { loading: boolean; message: string; ok: boolean };
const IDLE: FieldState = { loading: false, message: "", ok: false };

export default function SettingsPanel({
  profile,
  onClose,
  onProfileUpdated,
}: {
  profile: Profile;
  onClose: () => void;
  onProfileUpdated: (p: Profile) => void;
}) {
  const [nickname, setNickname] = useState("");
  const [gameId, setGameId] = useState("");
  const [promoCode, setPromoCode] = useState("");

  const [nickState, setNickState] = useState<FieldState>(IDLE);
  const [idState, setIdState] = useState<FieldState>(IDLE);
  const [promoState, setPromoState] = useState<FieldState>(IDLE);

  const [debugOpen, setDebugOpen] = useState(false);
  const [debugLoading, setDebugLoading] = useState(false);
  const [debugResult, setDebugResult] = useState<any>(null);

  async function runDebug() {
    setDebugOpen(true);
    setDebugLoading(true);
    try {
      const r = await fetch("/api/debug");
      setDebugResult(await r.json());
    } catch (e: any) {
      setDebugResult({ error: e.message || "Не удалось запустить диагностику" });
    } finally {
      setDebugLoading(false);
    }
  }

  async function submitNickname() {
    const value = nickname.trim();
    if (!value) return;
    setNickState({ loading: true, message: "", ok: false });
    try {
      const r = await fetch("/api/settings/nickname", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Telegram-Init-Data": getTelegramInitData() },
        body: JSON.stringify({ nickname: value }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Не удалось изменить ник");
      onProfileUpdated(data);
      setNickname("");
      setNickState({ loading: false, message: "Ник обновлён!", ok: true });
    } catch (e: any) {
      setNickState({ loading: false, message: e.message || "Ошибка", ok: false });
    }
  }

  async function submitGameId() {
    const value = gameId.trim();
    if (!value) return;
    setIdState({ loading: true, message: "", ok: false });
    try {
      const r = await fetch("/api/settings/gameid", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Telegram-Init-Data": getTelegramInitData() },
        body: JSON.stringify({ gameId: value }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Не удалось изменить игровой ID");
      onProfileUpdated(data);
      setGameId("");
      setIdState({ loading: false, message: "Игровой ID обновлён!", ok: true });
    } catch (e: any) {
      setIdState({ loading: false, message: e.message || "Ошибка", ok: false });
    }
  }

  async function submitPromo() {
    const value = promoCode.trim();
    if (!value) return;
    setPromoState({ loading: true, message: "", ok: false });
    try {
      const r = await fetch("/api/settings/promocode", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Telegram-Init-Data": getTelegramInitData() },
        body: JSON.stringify({ code: value }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Промокод не сработал");
      if (data.profile) onProfileUpdated(data.profile);
      setPromoCode("");
      setPromoState({ loading: false, message: `Активировано: ${data.rewardText || "награда"}!`, ok: true });
    } catch (e: any) {
      setPromoState({ loading: false, message: e.message || "Ошибка", ok: false });
    }
  }

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-panel" onClick={(e) => e.stopPropagation()}>
        <div className="search-bar-row">
          <div style={{ flex: 1 }}>
            <h1 className="brand-title" style={{ margin: 0, fontSize: 20 }}>
              Настройки
            </h1>
          </div>
          <button type="button" className="search-close" onClick={onClose} aria-label="Закрыть настройки">
            <X size={18} />
          </button>
        </div>

        <div className="search-results">
          <div className="settings-section">
            <div className="settings-section-title">
              <User size={12} style={{ display: "inline", marginRight: 5, verticalAlign: -1 }} />
              Никнейм
            </div>
            <div className="settings-current">Сейчас: {profile.nickname}</div>
            <div className="settings-row">
              <input
                className="settings-input"
                placeholder="Новый ник"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
              />
              <button type="button" className="settings-submit-btn" onClick={submitNickname} disabled={nickState.loading || !nickname.trim()}>
                {nickState.loading ? <Loader2 size={14} className="spin" /> : "Сохранить"}
              </button>
            </div>
            {nickState.message && <div className={`settings-feedback ${nickState.ok ? "ok" : "err"}`}>{nickState.message}</div>}
          </div>

          <div className="settings-section">
            <div className="settings-section-title">
              <Hash size={12} style={{ display: "inline", marginRight: 5, verticalAlign: -1 }} />
              Игровой ID
            </div>
            <div className="settings-current">Сейчас: {profile.gameId}</div>
            <div className="settings-row">
              <input
                className="settings-input"
                placeholder="Новый игровой ID"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                maxLength={24}
              />
              <button type="button" className="settings-submit-btn" onClick={submitGameId} disabled={idState.loading || !gameId.trim()}>
                {idState.loading ? <Loader2 size={14} className="spin" /> : "Сохранить"}
              </button>
            </div>
            {idState.message && <div className={`settings-feedback ${idState.ok ? "ok" : "err"}`}>{idState.message}</div>}
          </div>

          <div className="settings-section">
            <div className="settings-section-title">
              <Ticket size={12} style={{ display: "inline", marginRight: 5, verticalAlign: -1 }} />
              Промокод
            </div>
            <div className="settings-row">
              <input
                className="settings-input"
                placeholder="Введите промокод"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                maxLength={32}
              />
              <button type="button" className="settings-submit-btn" onClick={submitPromo} disabled={promoState.loading || !promoCode.trim()}>
                {promoState.loading ? <Loader2 size={14} className="spin" /> : "Активировать"}
              </button>
            </div>
            {promoState.message && <div className={`settings-feedback ${promoState.ok ? "ok" : "err"}`}>{promoState.message}</div>}
          </div>

          <div className="settings-section">
            <button type="button" className="debug-toggle-btn" onClick={runDebug}>
              <Stethoscope size={13} />
              Диагностика подключения
              <ChevronDown size={13} style={{ marginLeft: "auto", transform: debugOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }} />
            </button>
            {debugOpen && (
              <div className="debug-output">
                {debugLoading ? (
                  <span>Проверяю…</span>
                ) : (
                  <pre>{JSON.stringify(debugResult, null, 2)}</pre>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
