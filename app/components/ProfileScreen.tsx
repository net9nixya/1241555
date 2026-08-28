"use client";

import {
  BarChart3,
  ShieldCheck,
  Trophy,
  Swords,
  Target,
  Flame,
  HeartHandshake,
  Medal,
  Gamepad2,
  UserRound,
  Code2,
  Crown,
  Heart,
  Star,
  Sparkles,
  Shield,
  Zap,
  Gem,
  Ban,
  Gauge,
  type LucideIcon,
} from "lucide-react";
import type { Profile, Badge } from "../lib/types";
import TooltipWrap from "./Tooltip";

// Иконки для кастомных бейджей, выданных через админ-панель бота — ключ
// должен совпадать с тем, что бот кладёт в поле `icon` (см. BADGE_ICON_PRESETS
// в admin.py). Неизвестный/отсутствующий ключ — бейдж без иконки.
const CUSTOM_BADGE_ICONS: Record<string, LucideIcon> = {
  crown: Crown,
  code: Code2,
  shield: Shield,
  sparkles: Sparkles,
  star: Star,
  heart: Heart,
  flame: Flame,
  zap: Zap,
  gem: Gem,
  trophy: Trophy,
};

// "#rrggbb" -> "rgba(r,g,b,alpha)", чтобы делать полупрозрачный фон/рамку
// под любой цвет, который выберет админ (как у встроенных .badge-* классов).
function hexWithAlpha(hex: string, alpha: number): string {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16) || 0;
  const g = parseInt(h.slice(2, 4), 16) || 0;
  const b = parseInt(h.slice(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// "#rrggbb" -> "r, g, b", формат, ожидаемый CSS-переменной --glow-color в
// globals.css (используется внутри rgba(var(--glow-color), alpha)).
function hexToRgbTriplet(hex: string): string {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16) || 0;
  const g = parseInt(h.slice(2, 4), 16) || 0;
  const b = parseInt(h.slice(4, 6), 16) || 0;
  return `${r}, ${g}, ${b}`;
}

// Описания по умолчанию для встроенных бейджей (tone), которые показываются
// в тултипе, если бэкенд не прислал своё badge.description.
const DEFAULT_TONE_DESCRIPTIONS: Partial<Record<NonNullable<Badge["tone"]>, string>> = {
  vip: "У этого игрока активен VIP-статус.",
  dev: "Разработчик проекта.",
  admin: "Администратор проекта.",
  pink: "Особый статус игрока.",
  purple: "Особый статус игрока.",
};

// Бэкенд иногда присылает текст в Telegram HTML-разметке (например, карту
// матча с премиум-эмодзи бота: `<tg-emoji emoji-id="...">🗺</tg-emoji> Hanami`).
// Браузер такую разметку не парсит как HTML, поэтому вырезаем все теги и
// оставляем только видимый текст/эмодзи внутри них.
function stripTelegramHtml(text?: string | null): string {
  if (!text) return "";
  return text.replace(/<[^>]*>/g, "").trim();
}

// Геометрия квадратной рамки-прогресса вокруг аватара (см. avatar-ring-wrap
// в globals.css) — скруглённый квадрат вместо круга: 84×84 вьюбокс, сама
// рамка чуть меньше (78×78) с отступом 3px под толщину обводки, rx задаёт
// скругление углов ("гладкие углы", как в референсе).
const RING_BOX = 112;
const RING_INSET = 4;
const RING_SIZE = RING_BOX - RING_INSET * 2;
const RING_RADIUS = 29;

// Максимальный уровень в системе (см. admin.py бота / логику начисления
// уровней на бэкенде) — выше него расти некуда, ELO дальше не считается
// "до следующего уровня". Бэкенд иногда всё равно присылает nextLevel/needElo
// даже для игрока на максимуме (например, "До уровня 11 осталось 0 ELO" при
// level=10) — поэтому не полагаемся только на nextLevel и подстраховываемся
// этой константой на фронте.
const MAX_LEVEL = 10;

export default function ProfileScreen({ profile }: { profile: Profile }) {
  const x = profile;
  const initials = x.nickname.slice(0, 2).toUpperCase();

  // На калибровке ELO/уровень ещё не считаются "по-настоящему" — вместо
  // прогресса до следующего уровня показываем прогресс калибровочных
  // матчей. Максимальный уровень проверяем сами (см. комментарий у
  // MAX_LEVEL) и не показываем "до следующего уровня", даже если бэкенд
  // прислал nextLevel/needElo.
  const isCalibrating = !!x.calibration?.active;
  const isMaxLevel = !isCalibrating && x.level >= MAX_LEVEL;
  const showLevelProgress = !isCalibrating && !isMaxLevel && !!x.nextLevel;

  const progressPct = isCalibrating
    ? Math.max(6, Math.min(100, (x.calibration.played / Math.max(1, x.calibration.required)) * 100))
    : isMaxLevel
    ? 100
    : showLevelProgress
    ? Math.max(6, Math.min(97, 100 - (x.needElo / 400) * 100))
    : 100;

  // Периметр скруглённого квадрата: две пары прямых сторон + четыре четверти
  // окружности радиуса RING_RADIUS в углах.
  const ringCircumference = 2 * (RING_SIZE - 2 * RING_RADIUS) * 2 + 2 * Math.PI * RING_RADIUS;
  const ringOffset = ringCircumference * (1 - progressPct / 100);

  return (
    <>
      <h1 className="brand-title reveal">Counter Faceit</h1>

      {/* hero */}
      {/* Цвет свечения выбирается игроком в настройках (SettingsPanel →
          глава "Свечение профиля") и виден всем, кто открывает этот профиль
          — не только владельцу. x.glowColor === null означает "свечение
          отключено", тогда добавляем .hero-no-glow (см. globals.css).
          Баннер (x.bannerKey) — картинка-фон карточки, выдаётся только
          админом (см. BANNER_PRESETS в admin.py), надевается/снимается в
          настройках из своего инвентаря. Обрезается по краям самой
          карточки — .hero-banner-img лежит внутри .hero, у которого уже
          есть border-radius + overflow:hidden. Свечение остаётся поверх
          баннера (см. .hero-banner z-index в globals.css). */}
      <section
        className={`card hero reveal${x.glowColor ? "" : " hero-no-glow"}${x.bannerKey ? " hero-has-banner" : ""}`}
        style={{
          animationDelay: "0.02s",
          ...(x.glowColor ? ({ "--glow-color": hexToRgbTriplet(x.glowColor) } as React.CSSProperties) : {}),
        }}
      >
        {x.bannerKey && (
          <div className="hero-banner" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="hero-banner-img" src={`/banners/${x.bannerKey}.jpg`} alt="" />
          </div>
        )}
        <div className="hero-top">
          <div
            className={`avatar-ring-wrap${x.frameKey ? " avatar-ring-wrap-framed" : ""}`}
            style={{ "--ring-circumference": ringCircumference, "--ring-offset": ringOffset } as React.CSSProperties}
          >
            {!x.frameKey && (
              <svg viewBox={`0 0 ${RING_BOX} ${RING_BOX}`}>
                <defs>
                  <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff5c8a" />
                    <stop offset="100%" stopColor="#ffffff" />
                  </linearGradient>
                </defs>
                <rect
                  className="avatar-ring-track"
                  x={RING_INSET}
                  y={RING_INSET}
                  width={RING_SIZE}
                  height={RING_SIZE}
                  rx={RING_RADIUS}
                />
                <rect
                  className="avatar-ring-fill"
                  x={RING_INSET}
                  y={RING_INSET}
                  width={RING_SIZE}
                  height={RING_SIZE}
                  rx={RING_RADIUS}
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                />
              </svg>
            )}
            <div className="avatar">
              {x.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={x.avatarUrl} alt={x.nickname} />
              ) : (
                <span style={{ fontWeight: 800, fontSize: 22 }}>{initials}</span>
              )}
            </div>
            {x.frameKey && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="avatar-frame-deco" src={`/frames/${x.frameKey}.png`} alt="" aria-hidden="true" />
            )}
          </div>

          <div className="identity">
            <div className="name-row">
              {x.nickname}
              {x.verified && (
                <TooltipWrap description="Данный игрок верифицирован." placement="bottom">
                  <ShieldCheck size={17} className="verified-tick" />
                </TooltipWrap>
              )}
            </div>
            <div className="handle">
              {x.staticId != null ? (
                <>
                  STATIC #{x.staticId} · ID {x.gameId}
                </>
              ) : (
                <>
                  {x.gameId}
                  {x.username && ` · @${x.username}`}
                </>
              )}
            </div>
            <div className="badge-row">
              {x.badges?.map((b, i) => (
                <BadgePill key={b.id} badge={b} delay={0.1 + i * 0.06} />
              ))}
              <TooltipWrap description={`Этот игрок играет на приватке «${x.privatka || "Faceit"}».`}>
                <span className="badge" style={{ background: "rgba(255,255,255,.05)", color: "var(--muted)", animationDelay: "0.3s" }}>
                  <Gamepad2 size={12} />
                  {x.privatka || "Faceit"}
                </span>
              </TooltipWrap>
            </div>
          </div>
        </div>

        {x.banned?.active && (
          <div className="ban-mark">
            <span className="ban-mark-icon">
              <Ban size={15} />
            </span>
            <span>
              <b>Аккаунт забанен</b>
              {x.banned.until && <> до <b>{x.banned.until === "Навсегда" ? "конца времён" : x.banned.until}</b></>}
              {x.banned.reason && <>{" "}— {x.banned.reason}</>}
            </span>
          </div>
        )}
      </section>

      {/* rank */}
      <div className="section-title reveal" style={{ animationDelay: "0.08s" }}>
        Рейтинг
      </div>
      <section className="card rank-card reveal" style={{ animationDelay: "0.1s" }}>
        <div className="level-badge">{x.level}</div>
        <div className="rank-info">
          <div className="rank-top-row">
            <span className="rank-title">Уровень {x.level}</span>
            {isCalibrating ? (
              <span className="elo-pill tabular elo-pill-calibration">
                <Gauge size={13} />
                Калибровка
              </span>
            ) : (
              <span className="elo-pill tabular">
                <Swords size={13} />
                {x.elo} ELO
              </span>
            )}
          </div>
          {isCalibrating ? (
            <>
              <div className="rank-sub">
                Сыграно <b className="tabular">{x.calibration.played}</b> из{" "}
                <b className="tabular">{x.calibration.required}</b> калибровочных матчей
              </div>
              <div className="progress-track">
                <span className="progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
            </>
          ) : isMaxLevel ? (
            <div className="rank-sub">Достигнут максимальный уровень</div>
          ) : (
            showLevelProgress && (
              <>
                <div className="rank-sub">
                  До уровня {x.nextLevel} осталось <b className="tabular">{x.needElo}</b> ELO
                </div>
                <div className="progress-track">
                  <span className="progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
              </>
            )
          )}
        </div>
      </section>

      {/* stats */}
      <div className="section-title reveal" style={{ animationDelay: "0.14s" }}>
        Статистика
      </div>
      <div className="stat-grid">
        <Stat icon={<Trophy size={16} />} value={x.wins} label="Побед" delay={0.16} tone="gold" />
        <Stat icon={<Target size={16} />} value={`${x.winrate.toFixed(1)}%`} label="Winrate" delay={0.19} />
        <Stat icon={<BarChart3 size={16} />} value={x.kd.toFixed(2)} label="K/D" delay={0.22} tone="mint" />
        <Stat icon={<Flame size={16} />} value={x.winStreak} label="Серия побед" delay={0.25} tone="coral" />
        <Stat icon={<Swords size={16} />} value={x.kills} label="Убийства" delay={0.28} />
        <Stat icon={<HeartHandshake size={16} />} value={x.assists} label="Ассисты" delay={0.31} tone="mint" />
        <Stat icon={<UserRound size={16} />} value={x.deaths} label="Смерти" delay={0.34} tone="coral" />
        <Stat icon={<ShieldCheck size={16} />} value={x.trustFactor} label="Trust Factor" delay={0.37} tone="gold" />
      </div>

      {/* result */}
      <div className="section-title reveal" style={{ animationDelay: "0.4s" }}>
        Результат
      </div>
      <section className="card result-card reveal" style={{ animationDelay: "0.42s" }}>
        <div className="result-row">
          <span>Победы / поражения</span>
          <b className="tabular">
            {x.wins} / {x.losses}
          </b>
        </div>
        <div className="result-row">
          <span>W/L Ratio</span>
          <b className="tabular">{x.wlRatio.toFixed(2)}</b>
        </div>
        <div className="result-row">
          <span>Лучшая серия</span>
          <b className="tabular">{x.bestWinStreak}</b>
        </div>
      </section>

      {/* medals */}
      <div className="section-title reveal" style={{ animationDelay: "0.46s" }}>
        Медали
      </div>
      <section className="card medal-card reveal" style={{ animationDelay: "0.48s" }}>
        {x.medals.length ? (
          <div className="medal-list">
            {x.medals.map((m) => (
              <div className="medal-item" key={m.id}>
                <span className="medal-icon">
                  <Medal size={15} />
                </span>
                <span>{m.rank}</span>
              </div>
            ))}
          </div>
        ) : (
          <span className="empty-hint">Медалей пока нет.</span>
        )}
      </section>

      {/* matches */}
      <div className="section-title reveal" style={{ animationDelay: "0.52s" }}>
        Последние матчи
      </div>
      <section className="card matches-card reveal" style={{ animationDelay: "0.54s" }}>
        {x.matches.length ? (
          x.matches.map((m) => (
            <div className="match-item" key={m.id}>
              <div className="match-left">
                <span className={`match-dot ${m.result === "win" ? "dot-win" : m.result === "loss" ? "dot-loss" : "dot-pending"}`} />
                <div className="match-meta">
                  <div className={`match-result ${m.result === "win" ? "result-win" : m.result === "loss" ? "result-loss" : ""}`}>
                    {m.result === "win" ? "Победа" : m.result === "loss" ? "Поражение" : "В процессе"}
                  </div>
                  <div className="match-sub">
                    {stripTelegramHtml(m.map) || "Карта не указана"} · {stripTelegramHtml(m.mode) || "Матч"} · {m.kills}/{m.assists}/{m.deaths}
                  </div>
                </div>
              </div>
              <span className="match-elo tabular" style={{ color: m.eloChange > 0 ? "var(--mint)" : m.eloChange < 0 ? "var(--coral)" : "var(--muted)" }}>
                {m.eloChange > 0 ? "+" : ""}
                {m.eloChange} ELO
              </span>
            </div>
          ))
        ) : (
          <div className="empty-hint" style={{ padding: "14px 0" }}>
            История матчей появится здесь после первой игры.
          </div>
        )}
      </section>

      <div className="footer reveal" style={{ animationDelay: "0.58s" }}>
        Counter Faceit
      </div>
    </>
  );
}

function Stat({
  icon,
  value,
  label,
  delay,
  tone,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
  delay: number;
  // Необязательный цветовой акцент иконки (gold/mint/coral) — только
  // оформление, см. .stat-icon[data-tone] в globals.css. Без tone иконка
  // остаётся дефолтного акцентного (розового) цвета, как и раньше.
  tone?: "gold" | "mint" | "coral";
}) {
  return (
    <section className="card stat-card reveal" style={{ animationDelay: `${delay}s` }}>
      <div className="stat-icon" data-tone={tone}>{icon}</div>
      <span className="stat-value tabular" style={{ animationDelay: `${delay + 0.1}s` }}>
        {value}
      </span>
      <span className="stat-label">{label}</span>
    </section>
  );
}

function BadgePill({ badge, delay }: { badge: Badge; delay: number }) {
  let pill: React.ReactNode;

  if (badge.tone === "custom" || badge.color) {
    const color = badge.color || "#ffffff";
    const Icon = badge.icon ? CUSTOM_BADGE_ICONS[badge.icon] : null;
    pill = (
      <span
        className="badge"
        style={{
          animationDelay: `${delay}s`,
          background: hexWithAlpha(color, 0.14),
          color,
          borderColor: hexWithAlpha(color, 0.3),
        }}
      >
        {Icon && <Icon size={12} />}
        {badge.label}
      </span>
    );
  } else {
    const icon =
      badge.tone === "vip" ? <Crown size={12} /> :
      badge.tone === "dev" ? <Code2 size={12} /> :
      badge.tone === "admin" ? <Sparkles size={12} /> :
      badge.tone === "pink" ? <Heart size={12} /> :
      badge.tone === "purple" ? <Star size={12} /> :
      null;
    const cls =
      badge.tone === "vip" ? "badge badge-vip" :
      badge.tone === "dev" ? "badge badge-dev" :
      badge.tone === "admin" ? "badge badge-admin" :
      badge.tone === "pink" ? "badge badge-pink" :
      badge.tone === "purple" ? "badge badge-purple" :
      "badge";
    pill = (
      <span className={cls} style={{ animationDelay: `${delay}s` }}>
        {icon}
        {badge.label}
      </span>
    );
  }

  if (!badge.description && !badge.color && badge.tone) {
    badge = { ...badge, description: DEFAULT_TONE_DESCRIPTIONS[badge.tone] };
  }

  if (!badge.description) return pill;

  // Есть описание — оборачиваем в тултип-обёртку. На десктопе работает
  // :hover (CSS), но в Telegram (мобильный webview) наведения курсором не
  // существует — там только тапы, поэтому дублируем показ через клик/тап.
  return <TooltipWrap description={badge.description}>{pill}</TooltipWrap>;
}
