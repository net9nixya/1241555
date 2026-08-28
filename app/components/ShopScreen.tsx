"use client";

import { useState } from "react";
import { Crown, ShieldCheck, Wallet, Check } from "lucide-react";
import { shopItems, ShopItem } from "../lib/demo";
import { getTelegramInitData } from "../lib/telegram";
import type { Profile } from "../lib/types";

type ItemState = { loading: boolean; error: string };
const IDLE: ItemState = { loading: false, error: "" };

// Цветовой акцент строки — только оформление (см. globals.css, data-tone у
// .shop-row), никак не влияет на цену/логику покупки. VIP оформлен отдельной
// промо-карточкой сверху (см. FeaturedItem), поэтому в этой карте не нужен.
const ROW_TONE: Record<string, "mint" | "pink"> = {
  unban: "mint",
  frame_void: "pink",
  frame_cyber: "pink",
};

export default function ShopScreen({
  profile,
  onProfileUpdated,
}: {
  profile: Profile;
  onProfileUpdated: (p: Profile) => void;
}) {
  const [states, setStates] = useState<Record<string, ItemState>>({});

  async function buy(itemId: string) {
    setStates((s) => ({ ...s, [itemId]: { loading: true, error: "" } }));
    try {
      const r = await fetch("/api/shop/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Telegram-Init-Data": getTelegramInitData() },
        body: JSON.stringify({ itemId }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Не удалось купить");
      onProfileUpdated(data);
      setStates((s) => ({ ...s, [itemId]: IDLE }));
    } catch (e: any) {
      setStates((s) => ({ ...s, [itemId]: { loading: false, error: e.message || "Ошибка" } }));
    }
  }

  // VIP — самый заметный товар, выносим его отдельной промо-карточкой
  // сверху (как крупные карточки с ценником в референсе), остальное —
  // компактным списком ниже. Сами товары и цены те же, что и раньше
  // (shopItems из lib/demo.ts) — меняется только то, как это разложено по
  // экрану.
  const featured = shopItems.find((i) => i.id === "vip");
  const rest = shopItems.filter((i) => i.id !== "vip");

  return (
    <>
      <h1 className="brand-title reveal">Магазин</h1>

      <p className="shop-intro reveal" style={{ animationDelay: "0.03s" }}>
        Оплата Counter Coin. Пополнить баланс можно у администрации.
      </p>

      {featured && (
        <FeaturedItem
          item={featured}
          state={states[featured.id] || IDLE}
          canAfford={profile.coins >= featured.price}
          onBuy={() => buy(featured.id)}
        />
      )}

      <div className="section-title reveal" style={{ animationDelay: "0.14s" }}>
        Товары
      </div>

      {rest.map((item, i) => {
        const owned = item.isFrame && item.frameKey ? profile.frameInventory.includes(item.frameKey) : false;
        return (
          <ShopRow
            key={item.id}
            item={item}
            profile={profile}
            owned={owned}
            canAfford={profile.coins >= item.price}
            state={states[item.id] || IDLE}
            onBuy={() => buy(item.id)}
            delay={0.18 + i * 0.05}
          />
        );
      })}

      <div className="footer reveal" style={{ animationDelay: "0.4s" }}>
        Купленные рамки надеваются в настройках профиля
      </div>
    </>
  );
}

function FeaturedItem({
  item,
  state,
  canAfford,
  onBuy,
}: {
  item: ShopItem;
  state: ItemState;
  canAfford: boolean;
  onBuy: () => void;
}) {
  return (
    <section className="card shop-featured reveal" style={{ animationDelay: "0.06s" }}>
      <span className="shop-featured-badge">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/counter-coin.png" alt="" aria-hidden="true" />
        {item.price}
      </span>

      <div className="shop-featured-icon">
        <Crown size={26} />
      </div>

      <div className="shop-featured-title">{item.title}</div>
      <p className="shop-featured-desc">{item.description}</p>
      {item.durationText && <span className="shop-featured-duration">{item.durationText}</span>}

      <button
        type="button"
        className="shop-featured-buy"
        onClick={onBuy}
        disabled={state.loading || !canAfford}
      >
        <Wallet size={15} />
        {state.loading ? "Покупаем…" : canAfford ? "Купить" : "Не хватает Counter Coin"}
      </button>

      {state.error && <div className="shop-item-error">{state.error}</div>}
    </section>
  );
}

function ShopRow({
  item,
  profile,
  owned,
  canAfford,
  state,
  onBuy,
  delay,
}: {
  item: ShopItem;
  profile: Profile;
  owned: boolean;
  canAfford: boolean;
  state: ItemState;
  onBuy: () => void;
  delay: number;
}) {
  const tone = ROW_TONE[item.id] || "pink";

  return (
    <section className="card shop-row reveal" data-tone={tone} style={{ animationDelay: `${delay}s` }}>
      {item.isFrame && item.frameKey ? (
        <span className="shop-frame-preview">
          <span className="shop-frame-preview-photo">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt="" />
            ) : null}
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="shop-frame-preview-deco" src={`/frames/${item.frameKey}.png`} alt="" aria-hidden="true" />
        </span>
      ) : (
        <span className="shop-row-icon">
          <ShieldCheck size={20} />
        </span>
      )}

      <div className="shop-row-body">
        <div className="shop-row-title">{item.title}</div>
        <div className="shop-row-desc">{item.description}</div>
        <div className="shop-row-price tabular">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/counter-coin.png" alt="" aria-hidden="true" />
          {item.price}
          {!canAfford && !owned && <span className="shop-row-price-warn"> · не хватает</span>}
        </div>
      </div>

      <button
        type="button"
        className={`shop-row-cta ${owned ? "owned" : ""}`}
        onClick={onBuy}
        disabled={state.loading || owned || !canAfford}
      >
        {owned ? (
          <Check size={15} />
        ) : (
          <>
            <Wallet size={13} />
            {state.loading ? "…" : "Купить"}
          </>
        )}
      </button>

      {state.error && <div className="shop-item-error">{state.error}</div>}
    </section>
  );
}
