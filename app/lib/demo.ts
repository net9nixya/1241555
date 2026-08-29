import type { Profile } from "./types";

export const demoProfile: Profile = {
  nickname: "паранойя",
  gameId: "faceit",
  username: "paranoya123",
  avatarUrl: "/avatar3.jpg",
  frameKey: "frame_angel",
  frameInventory: ["frame_gold", "frame_void"],
  bannerKey: "banner_skulls",
  bannerInventory: ["banner_skulls"],
  coins: 730,
  glowColor: null,
  staticId: 5053,
  badges: [
    { id: "vip", label: "VIP", tone: "vip" },
    { id: "admin", label: "Admin", tone: "admin" },
    { id: "femboy", label: "Фембой", tone: "pink" },
    { id: "custom", label: "Developer", tone: "custom", color: "#ffffff", icon: "code", description: "Написал и поддерживает этот мини-апп" },
  ],
  banned: null,
  devVerified: true,
  elo: 200,
  wins: 0,
  losses: 4,
  winrate: 0.0,
  wlRatio: 0.0,
  kd: 2.14,
  kills: 14,
  assists: 0,
  deaths: 30,
  winStreak: 0,
  bestWinStreak: 0,
  trustFactor: 100,
  warns: 0,
  vip: true,
  verified: true,
  level: 1,
  nextLevel: 2,
  needElo: 100,
  calibration: { active: false, played: 10, required: 10 },
  privatka: "StandLeo",
  medals: [
    { id: "m1", rank: "Первая победа", awardedAt: "2026-08-24" },
  ],
  matches: [
    {
      id: 1,
      result: "loss",
      eloChange: 18,
      eloAfter: 200,
      kills: 16,
      assists: 3,
      deaths: 9,
      map: "Zone 7",
      mode: "1v1",
      createdAt: "2026-08-24",
    },
    {
      id: 2,
      result: "loss",
      eloChange: -12,
      eloAfter: 182,
      kills: 11,
      assists: 2,
      deaths: 14,
      map: "Rust",
      mode: "2v2",
      createdAt: "2026-08-23",
    },
    {
      id: 3,
      result: "loss",
      eloChange: 21,
      eloAfter: 194,
      kills: 23,
      assists: 7,
      deaths: 17,
      map: "Province",
      mode: "3v3",
      createdAt: "2026-08-23",
    },
    {
      id: 4,
      result: "loss",
      eloChange: -15,
      eloAfter: 173,
      kills: 18,
      assists: 5,
      deaths: 22,
      map: "Breeze",
      mode: "5v5",
      createdAt: "2026-08-22",
    },
    {
      id: 5,
      result: "win",
      eloChange: 20,
      eloAfter: 188,
      kills: 26,
      assists: 8,
      deaths: 19,
      map: "Zone 9",
      mode: "5v5",
      createdAt: "2026-08-21",
    },
  ],
};

export type TopEntry = {
  nickname: string;
  value: string;
  verified: boolean;
  // Вторая "верификация" только для мини-аппа (иконка </>), выдаётся
  // командой бота /dev — см. types.ts Profile.devVerified.
  devVerified?: boolean;
  // Кастомные бейджи, выданные через админ-панель бота (может быть несколько).
  badges?: { label: string; color: string; icon: string | null }[];
};
export type TopBoard = { id: string; label: string; entries: TopEntry[] };

export const topBoards: TopBoard[] = [
  {
    id: "elo",
    label: "По Эло",
    entries: [
      { nickname: "shadowplay", value: "3120 эло", verified: true },
      { nickname: "nomercy", value: "2894 эло", verified: true },
      { nickname: "ktzone", value: "2710 эло", verified: false },
      { nickname: "reverze", value: "2655 эло", verified: false },
      { nickname: "weralow", value: "2140 эло", verified: true, devVerified: true },
    ],
  },
  {
    id: "kd",
    label: "По КД",
    entries: [
      { nickname: "onetap", value: "2.31 КД", verified: true },
      { nickname: "clutchgod", value: "2.02 КД", verified: false },
      { nickname: "silentx", value: "1.94 КД", verified: true },
      { nickname: "weralow", value: "1.34 КД", verified: true, devVerified: true },
      { nickname: "drift", value: "1.28 КД", verified: false },
    ],
  },
  {
    id: "wins",
    label: "По победам",
    entries: [
      { nickname: "veteranop", value: "412 побед", verified: true },
      { nickname: "grindmode", value: "388 побед", verified: false },
      { nickname: "weralow", value: "187 побед", verified: true, devVerified: true },
      { nickname: "casualcs", value: "150 побед", verified: false },
      { nickname: "newblood", value: "94 победы", verified: false },
    ],
  },
];

export type ShopItem = {
  id: string;
  title: string;
  description: string;
  // Цена в Counter Coin — единственная валюта магазина.
  price: number;
  durationText?: string;
  // Рамки в магазине показываются с превью на аватарке игрока (см.
  // ShopScreen.tsx) — этот флаг отличает их от обычных товаров (VIP,
  // Разбан), у которых такого превью нет.
  isFrame?: boolean;
  frameKey?: string;
};

export const shopItems: ShopItem[] = [
  {
    id: "vip",
    title: "VIP статус",
    description: "Множитель ELO x1.1 за победы. Выделяет ник короной во всех топах и профиле.",
    price: 500,
    durationText: "1 месяц",
  },
  {
    id: "unban",
    title: "Разбан",
    description: "Снятие бана с аккаунта на Faceit.",
    price: 1000,
  },
  {
    id: "frame_void",
    title: "Рамка «Войд»",
    description: "Тёмная рамка аватара с эффектом пустоты.",
    price: 199,
    isFrame: true,
    frameKey: "frame_void",
  },
  {
    id: "frame_cyber",
    title: "Рамка «Кибер»",
    description: "Неоновая кибер-рамка аватара.",
    price: 249,
    isFrame: true,
    frameKey: "frame_cyber",
  },
];
