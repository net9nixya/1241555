import type { Profile } from "./types";

export const demoProfile: Profile = {
  nickname: "паранойя",
  gameId: "faceit",
  username: "paranoya123",
  avatarUrl: "/avatar3.jpg",
  frameKey: "frame_gold",
  frameInventory: ["frame_gold", "frame_void"],
  bannerKey: "banner_skulls",
  bannerInventory: ["banner_skulls"],
  nickColor: "#4da3ff",
  nickColorInventory: ["blue"],
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
  paidVerified: false,
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
  // Покупная верификация (красная иконка) — см. types.ts Profile.paidVerified.
  paidVerified?: boolean;
  // HEX цвета ника, если куплен и надет — см. types.ts Profile.nickColor.
  nickColor?: string | null;
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

export type ShopCategory = "general" | "frames" | "nickColors" | "verification";

export type ShopItem = {
  id: string;
  title: string;
  description: string;
  // Цена в Counter Coin — единственная валюта магазина.
  price: number;
  durationText?: string;
  // Вкладка магазина, в которой лежит товар (см. ShopScreen.tsx) —
  // "general" (VIP, Разбан) идёт отдельной промо-карточкой + списком,
  // остальные — по своим вкладкам.
  category: ShopCategory;
  // Рамки в магазине показываются с превью на аватарке игрока (см.
  // ShopScreen.tsx) — этот флаг отличает их от обычных товаров (VIP,
  // Разбан), у которых такого превью нет.
  isFrame?: boolean;
  frameKey?: string;
  // Цвет ника в магазине показывается кружком-превью этого HEX (см.
  // ShopScreen.tsx) — только для category === "nickColors".
  isNickColor?: boolean;
  colorKey?: string;
  colorHex?: string;
};

export const shopItems: ShopItem[] = [
  {
    id: "vip",
    title: "VIP статус",
    description: "Множитель ELO x1.1 за победы. Выделяет ник короной во всех топах и профиле.",
    price: 500,
    durationText: "1 месяц",
    category: "general",
  },
  {
    id: "unban",
    title: "Разбан",
    description: "Снятие бана с аккаунта на Faceit.",
    price: 1000,
    category: "general",
  },
  {
    id: "frame_void",
    title: "Рамка «Войд»",
    description: "Тёмная рамка аватара с эффектом пустоты.",
    price: 199,
    category: "frames",
    isFrame: true,
    frameKey: "frame_void",
  },
  {
    id: "frame_cyber",
    title: "Рамка «Кибер»",
    description: "Неоновая кибер-рамка аватара.",
    price: 249,
    category: "frames",
    isFrame: true,
    frameKey: "frame_cyber",
  },
  {
    id: "nick_color_pink",
    title: "Розовый ник",
    description: "Перекрашивает ваш никнейм в фирменный розовый во всех топах и профиле.",
    price: 300,
    category: "nickColors",
    isNickColor: true,
    colorKey: "pink",
    colorHex: "#ff2f78",
  },
  {
    id: "nick_color_blue",
    title: "Синий ник",
    description: "Перекрашивает ваш никнейм в синий во всех топах и профиле.",
    price: 300,
    category: "nickColors",
    isNickColor: true,
    colorKey: "blue",
    colorHex: "#4da3ff",
  },
  {
    id: "nick_color_green",
    title: "Зелёный ник",
    description: "Перекрашивает ваш никнейм в зелёный во всех топах и профиле.",
    price: 300,
    category: "nickColors",
    isNickColor: true,
    colorKey: "green",
    colorHex: "#3ddc84",
  },
  {
    id: "nick_color_red",
    title: "Красный ник",
    description: "Перекрашивает ваш никнейм в красный во всех топах и профиле.",
    price: 300,
    category: "nickColors",
    isNickColor: true,
    colorKey: "red",
    colorHex: "#ff4d4f",
  },
  {
    id: "paid_verify",
    title: "Покупная верификация",
    description: "Отдельный красный значок верификации рядом с ником — только в мини-аппе. Не заменяет обычную верификацию от администрации.",
    price: 10000,
    category: "verification",
  },
];
