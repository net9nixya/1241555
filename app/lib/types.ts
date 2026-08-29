export type Match = {
  id: number;
  result: "win" | "loss" | "pending";
  eloChange: number;
  eloAfter: number | null;
  kills: number;
  assists: number;
  deaths: number;
  map: string | null;
  mode: string | null;
  createdAt: string;
};

export type BadgeIcon =
  | "crown"
  | "code"
  | "shield"
  | "sparkles"
  | "star"
  | "heart"
  | "flame"
  | "zap"
  | "gem"
  | "trophy";

export type Badge = {
  id: string;
  label: string;
  tone: "vip" | "dev" | "admin" | "pink" | "purple" | "default" | "custom";
  // Только для tone === "custom": цвет и иконка, выданные через админ-панель.
  color?: string | null;
  icon?: BadgeIcon | string | null;
  // Необязательное описание — показывается всплывающей подсказкой при
  // наведении на бейдж в мини-аппе.
  description?: string | null;
};

export type BanInfo = {
  active: boolean;
  until: string | null;
  reason: string | null;
};

export type Profile = {
  nickname: string;
  gameId: string;
  username: string | null;
  avatarUrl: string | null;
  // Ключ рамки аватара (см. AVATAR_FRAME_PRESETS в admin.py бота), картинка
  // берётся из /frames/<frameKey>.png. null — рамка не выдана/не надета.
  frameKey: string | null;
  // Все рамки, которыми владеет игрок (куплены за Counter Coin в магазине
  // или выданы админом) — из этого списка строится выбор рамки в
  // настройках. frameKey всегда либо null, либо один из элементов этого
  // массива.
  frameInventory: string[];
  // Ключ баннера hero-карточки (фон под аватаркой/ником/бейджами), см.
  // BANNER_PRESETS в admin.py бота, картинка берётся из
  // /banners/<bannerKey>.jpg. null — баннер не выдан/не надет. Пока не
  // продаётся в магазине — только выдаётся админом.
  bannerKey: string | null;
  // Все баннеры, которыми владеет игрок (выданы админом) — из этого списка
  // строится выбор баннера в настройках. bannerKey всегда либо null, либо
  // один из элементов этого массива.
  bannerInventory: string[];
  // Баланс Counter Coin — единственная валюта магазина мини-аппа.
  coins: number;
  // Цвет свечения hero-карточки профиля (аватар + фон карточки), выбирается
  // самим игроком в настройках мини-аппа — HEX-строка вида "#ff2f78".
  // null — свечение отключено игроком. Видно всем, кто открывает этот
  // профиль (свой профиль, клик по игроку в топе, поиск).
  glowColor: string | null;
  // Публичный порядковый номер игрока ("STATIC #5053"), выдаётся один раз
  // при регистрации (см. assign_static_number в database.py бота).
  // Показывается в шапке профиля вместо "faceit · @username". null — номер
  // ещё не выдан (аккаунт зарегистрирован до внедрения системы, и бэкфилл
  // на сервере ещё не запускали) — в этом случае мини-апп временно
  // показывает старый вид ("faceit · @username").
  staticId: number | null;
  banned?: BanInfo | null;
  badges: Badge[];
  elo: number;
  wins: number;
  losses: number;
  winrate: number;
  wlRatio: number;
  kd: number;
  kills: number;
  assists: number;
  deaths: number;
  winStreak: number;
  bestWinStreak: number;
  trustFactor: number;
  warns: number;
  vip: boolean;
  verified: boolean;
  // Вторая, отдельная от verified "верификация" — только для мини-аппа
  // (в самом боте тегом не показывается). Выдаётся командой бота
  // /dev <telegram_id>. Рисуется как иконка </> рядом с ником и должна
  // стоять ПЕРЕД обычной галочкой verified, если у игрока есть обе.
  devVerified?: boolean;
  level: number;
  nextLevel: number | null;
  needElo: number;
  calibration: { active: boolean; played: number; required: number };
  privatka: string | null;
  medals: { id: string; rank: string; awardedAt: string }[];
  matches: Match[];
};
