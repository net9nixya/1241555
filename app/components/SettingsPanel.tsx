"use client";

import { useState } from "react";
import { X, User, Hash, Ticket, Loader2, Sparkles, Ban, ImageIcon, GalleryHorizontal, Palette } from "lucide-react";
import { getTelegramInitData } from "../lib/telegram";
import type { Profile } from "../lib/types";

type FieldState = { loading: boolean; message: string; ok: boolean };
const IDLE: FieldState = { loading: false, message: "", ok: false };

// Готовая палитра для быстрого выбора — фирменный розовый (цвет по
// умолчанию) первым, дальше нейтральный белый (как просили в задаче) и
// ещё несколько контрастных тонов, которые хорошо видно на тёмном фоне
// карточки. Свободный HEX ниже покрывает всё остальное.
const GLOW_PRESETS = [
  { hex: "#ff0055", label: "Розовый" },
  { hex: "#ffffff", label: "Белый" },
  { hex: "#4ef0c8", label: "Мятный" },
  { hex: "#ffc857", label: "Золотой" },
  { hex: "#6c8bff", label: "Синий" },
  { hex: "#b76cff", label: "Фиолетовый" },
  { hex: "#ff6b6b", label: "Коралловый" },
] as const;

const HEX_RE = /^#?[0-9a-fA-F]{6}$/;

// Соответствует NICK_COLOR_PRESETS в database.py — ключ инвентаря → HEX и
// подпись для UI выбора цвета ника в настройках.
const NICK_COLOR_PRESETS: Record<string, { hex: string; label: string }> = {
  pink: { hex: "#ff2f78", label: "Розовый" },
  blue: { hex: "#4da3ff", label: "Синий" },
  green: { hex: "#3ddc84", label: "Зелёный" },
  red: { hex: "#ff4d4f", label: "Красный" },
};

function normalizeHex(v: string): string | null {
  const trimmed = v.trim();
  if (!HEX_RE.test(trimmed)) return null;
  return trimmed.startsWith("#") ? trimmed.toLowerCase() : `#${trimmed.toLowerCase()}`;
}

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
  const [glowState, setGlowState] = useState<FieldState>(IDLE);
  const [frameState, setFrameState] = useState<FieldState>(IDLE);
  const [bannerState, setBannerState] = useState<FieldState>(IDLE);
  const [nickColorState, setNickColorState] = useState<FieldState>(IDLE);

  // Черновик HEX в текстовом поле — независим от profile.glowColor, пока
  // игрок не нажмёт "Сохранить"/не выберет пресет/не откроет системный
  // пикер (те применяются сразу, без промежуточного черновика).
  const [hexDraft, setHexDraft] = useState(profile.glowColor || "");

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

  async function applyGlowColor(hex: string | null) {
    setGlowState({ loading: true, message: "", ok: false });
    try {
      const r = await fetch("/api/settings/glowcolor", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Telegram-Init-Data": getTelegramInitData() },
        body: JSON.stringify({ color: hex }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Не удалось изменить свечение");
      onProfileUpdated(data);
      setHexDraft(hex || "");
      setGlowState({ loading: false, message: hex ? "Свечение обновлено!" : "Свечение отключено", ok: true });
    } catch (e: any) {
      setGlowState({ loading: false, message: e.message || "Ошибка", ok: false });
    }
  }

  function submitGlowHex() {
    const normalized = normalizeHex(hexDraft);
    if (!normalized) {
      setGlowState({ loading: false, message: "Введите цвет в формате #RRGGBB", ok: false });
      return;
    }
    applyGlowColor(normalized);
  }

  async function applyFrame(frameKey: string | null) {
    setFrameState({ loading: true, message: "", ok: false });
    try {
      const r = await fetch("/api/settings/frame", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Telegram-Init-Data": getTelegramInitData() },
        body: JSON.stringify({ frameKey }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Не удалось сменить рамку");
      onProfileUpdated(data);
      setFrameState({ loading: false, message: frameKey ? "Рамка надета!" : "Рамка снята", ok: true });
    } catch (e: any) {
      setFrameState({ loading: false, message: e.message || "Ошибка", ok: false });
    }
  }

  async function applyBanner(bannerKey: string | null) {
    setBannerState({ loading: true, message: "", ok: false });
    try {
      const r = await fetch("/api/settings/banner", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Telegram-Init-Data": getTelegramInitData() },
        body: JSON.stringify({ bannerKey }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Не удалось сменить баннер");
      onProfileUpdated(data);
      setBannerState({ loading: false, message: bannerKey ? "Баннер надет!" : "Баннер снят", ok: true });
    } catch (e: any) {
      setBannerState({ loading: false, message: e.message || "Ошибка", ok: false });
    }
  }

  async function applyNickColor(colorKey: string | null) {
    setNickColorState({ loading: true, message: "", ok: false });
    try {
      const r = await fetch("/api/settings/nickcolor", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Telegram-Init-Data": getTelegramInitData() },
        body: JSON.stringify({ colorKey }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Не удалось сменить цвет ника");
      onProfileUpdated(data);
      setNickColorState({ loading: false, message: colorKey ? "Цвет ника применён!" : "Цвет ника сброшен", ok: true });
    } catch (e: any) {
      setNickColorState({ loading: false, message: e.message || "Ошибка", ok: false });
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
            <div className="settings-section-title">
              <ImageIcon size={12} style={{ display: "inline", marginRight: 5, verticalAlign: -1 }} />
              Рамки
            </div>
            {profile.frameInventory.length === 0 ? (
              <div className="frame-inventory-empty">
                Пока нет ни одной рамки — купите в Магазине или получите от администрации.
              </div>
            ) : (
              <div className="frame-inventory-grid">
                <button
                  type="button"
                  className={`frame-slot-btn ${!profile.frameKey ? "active" : ""}`}
                  title="Без рамки"
                  aria-label="Без рамки"
                  disabled={frameState.loading}
                  onClick={() => applyFrame(null)}
                >
                  <Ban size={18} className="frame-slot-none" />
                </button>
                {profile.frameInventory.map((frameKey) => (
                  <button
                    key={frameKey}
                    type="button"
                    className={`frame-slot-btn ${profile.frameKey === frameKey ? "active" : ""}`}
                    title={frameKey}
                    aria-label={frameKey}
                    disabled={frameState.loading}
                    onClick={() => applyFrame(frameKey)}
                  >
                    <span className="frame-slot-preview">
                      <span className="frame-slot-preview-photo">
                        {profile.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={profile.avatarUrl} alt="" />
                        ) : null}
                      </span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="frame-slot-preview-deco" src={`/frames/${frameKey}.png`} alt="" aria-hidden="true" />
                    </span>
                  </button>
                ))}
              </div>
            )}
            {frameState.message && <div className={`settings-feedback ${frameState.ok ? "ok" : "err"}`}>{frameState.message}</div>}
          </div>

          <div className="settings-section">
            <div className="settings-section-title">
              <GalleryHorizontal size={12} style={{ display: "inline", marginRight: 5, verticalAlign: -1 }} />
              Баннеры
            </div>
            {profile.bannerInventory.length === 0 ? (
              <div className="frame-inventory-empty">
                Пока нет ни одного баннера — их выдаёт администрация.
              </div>
            ) : (
              <div className="banner-inventory-list">
                <button
                  type="button"
                  className={`banner-slot-btn banner-slot-btn-none ${!profile.bannerKey ? "active" : ""}`}
                  disabled={bannerState.loading}
                  onClick={() => applyBanner(null)}
                >
                  <Ban size={16} />
                  Без баннера
                </button>
                {profile.bannerInventory.map((bannerKey) => (
                  <button
                    key={bannerKey}
                    type="button"
                    className={`banner-slot-btn ${profile.bannerKey === bannerKey ? "active" : ""}`}
                    disabled={bannerState.loading}
                    onClick={() => applyBanner(bannerKey)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="banner-slot-preview" src={`/banners/${bannerKey}.jpg`} alt="" />
                  </button>
                ))}
              </div>
            )}
            {bannerState.message && <div className={`settings-feedback ${bannerState.ok ? "ok" : "err"}`}>{bannerState.message}</div>}
          </div>

          <div className="settings-section">
            <div className="settings-section-title">
              <Palette size={12} style={{ display: "inline", marginRight: 5, verticalAlign: -1 }} />
              Цвет ника
            </div>
            {profile.nickColorInventory.length === 0 ? (
              <div className="frame-inventory-empty">
                Пока нет ни одного цвета — купите в Магазине, вкладка «Цвет ника».
              </div>
            ) : (
              <div className="glow-swatch-grid">
                {profile.nickColorInventory.map((colorKey) => {
                  const preset = NICK_COLOR_PRESETS[colorKey];
                  if (!preset) return null;
                  return (
                    <button
                      key={colorKey}
                      type="button"
                      className={`glow-swatch-btn ${profile.nickColor?.toLowerCase() === preset.hex ? "active" : ""}`}
                      style={{ background: preset.hex }}
                      title={preset.label}
                      aria-label={preset.label}
                      disabled={nickColorState.loading}
                      onClick={() => applyNickColor(colorKey)}
                    />
                  );
                })}
                <button
                  type="button"
                  className={`glow-swatch-btn glow-swatch-btn-off ${!profile.nickColor ? "active" : ""}`}
                  title="Без цвета"
                  aria-label="Без цвета"
                  disabled={nickColorState.loading}
                  onClick={() => applyNickColor(null)}
                >
                  <Ban size={14} />
                </button>
              </div>
            )}
            {nickColorState.message && (
              <div className={`settings-feedback ${nickColorState.ok ? "ok" : "err"}`}>{nickColorState.message}</div>
            )}
          </div>

          <div className="settings-section">
            <div className="settings-section-title">
              <Sparkles size={12} style={{ display: "inline", marginRight: 5, verticalAlign: -1 }} />
              Свечение профиля
            </div>
            <div className="glow-current-row">
              <span
                className={`glow-current-swatch ${profile.glowColor ? "" : "is-off"}`}
                style={
                  profile.glowColor
                    ? ({ background: profile.glowColor, "--glow-swatch-shadow": profile.glowColor } as React.CSSProperties)
                    : undefined
                }
              />
              <span className="glow-current-text">
                {profile.glowColor ? `Сейчас: ${profile.glowColor}` : "Сейчас: свечение отключено"}
              </span>
            </div>

            <div className="glow-swatch-grid">
              {GLOW_PRESETS.map((p) => (
                <button
                  key={p.hex}
                  type="button"
                  className={`glow-swatch-btn ${profile.glowColor?.toLowerCase() === p.hex ? "active" : ""}`}
                  style={{ background: p.hex }}
                  title={p.label}
                  aria-label={p.label}
                  disabled={glowState.loading}
                  onClick={() => applyGlowColor(p.hex)}
                />
              ))}
              <button
                type="button"
                className={`glow-swatch-btn glow-swatch-btn-off ${!profile.glowColor ? "active" : ""}`}
                title="Без свечения"
                aria-label="Без свечения"
                disabled={glowState.loading}
                onClick={() => applyGlowColor(null)}
              >
                <Ban size={14} />
              </button>
            </div>

            <div className="glow-custom-row">
              <label
                className="glow-color-native-swatch"
                style={
                  {
                    "--glow-picker-preview": hexDraft && normalizeHex(hexDraft) ? normalizeHex(hexDraft) : "transparent",
                    "--glow-picker-has-color": hexDraft && normalizeHex(hexDraft) ? 1 : 0,
                  } as React.CSSProperties
                }
              >
                <input
                  type="color"
                  className="glow-color-native"
                  value={normalizeHex(hexDraft) || "#ff0055"}
                  onChange={(e) => applyGlowColor(e.target.value)}
                  aria-label="Выбрать произвольный цвет"
                />
              </label>
              <input
                className="glow-hex-input"
                placeholder="#RRGGBB"
                value={hexDraft}
                onChange={(e) => setHexDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitGlowHex()}
                maxLength={7}
              />
              <button type="button" className="settings-submit-btn" onClick={submitGlowHex} disabled={glowState.loading}>
                {glowState.loading ? <Loader2 size={14} className="spin" /> : "OK"}
              </button>
            </div>
            {glowState.message && <div className={`settings-feedback ${glowState.ok ? "ok" : "err"}`}>{glowState.message}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
