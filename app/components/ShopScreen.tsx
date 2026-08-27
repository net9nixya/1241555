"use client";

import { useState } from "react";
import { Crown, ShieldCheck, Wallet, Check } from "lucide-react";
import { shopItems } from "../lib/demo";
import { getTelegramInitData } from "../lib/telegram";
import type { Profile } from "../lib/types";

type ItemState = { loading: boolean; error: string };
const IDLE: ItemState = { loading: false, error: "" };

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

  return (
    <>
      <h1 className="brand-title reveal">Магазин</h1>

      <p className="shop-intro reveal" style={{ animationDelay: "0.03s" }}>
        Оплата Counter Coin. Пополнить баланс можно у администрации.
      </p>

      {shopItems.map((item, i) => {
        const state = states[item.id] || IDLE;
        const owned = item.isFrame && item.frameKey ? profile.frameInventory.includes(item.frameKey) : false;
        const canAfford = profile.coins >= item.price;

        return (
          <section
            className={`card shop-item reveal ${item.isFrame ? "shop-frame-item" : ""}`}
            key={item.id}
            style={{ animationDelay: `${0.06 + i * 0.05}s` }}
          >
            <div className="shop-item-head">
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
                <span className="shop-item-icon">
                  {item.id === "vip" ? <Crown size={18} /> : <ShieldCheck size={18} />}
                </span>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="shop-item-title">{item.title}</div>
                {item.durationText && <div className="shop-item-duration">{item.durationText}</div>}
              </div>
            </div>

            <p className="shop-item-desc">{item.description}</p>

            <div className="shop-item-foot">
              <div className="shop-price">
                <b className="tabular">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/counter-coin.png" alt="" aria-hidden="true" />
                  {item.price}
                </b>
                {!canAfford && !owned && <span>Не хватает Counter Coin</span>}
              </div>
              <button
                type="button"
                className={`shop-buy-btn ${owned ? "owned" : ""}`}
                onClick={() => buy(item.id)}
                disabled={state.loading || owned || !canAfford}
              >
                {owned ? (
                  <>
                    <Check size={14} />
                    Куплено
                  </>
                ) : (
                  <>
                    <Wallet size={14} />
                    {state.loading ? "Покупаем…" : "Купить"}
                  </>
                )}
              </button>
            </div>
            {state.error && <div className="shop-item-error">{state.error}</div>}
          </section>
        );
      })}

      <div className="footer reveal" style={{ animationDelay: "0.2s" }}>
        Купленные рамки надеваются в настройках профиля
      </div>
    </>
  );
}
