"use client";

import { Crown, ShieldCheck, Wallet } from "lucide-react";
import { shopItems } from "../lib/demo";

export default function ShopScreen() {
  return (
    <>
      <h1 className="brand-title reveal">Магазин</h1>

      <p className="shop-intro reveal" style={{ animationDelay: "0.03s" }}>
        Оплата рублями, звёздами Telegram или криптой через @send.
      </p>

      {shopItems.map((item, i) => (
        <section className="card shop-item reveal" key={item.id} style={{ animationDelay: `${0.06 + i * 0.05}s` }}>
          <div className="shop-item-head">
            <span className="shop-item-icon">
              {item.id === "vip" ? <Crown size={18} /> : <ShieldCheck size={18} />}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="shop-item-title">{item.title}</div>
              {item.durationText && <div className="shop-item-duration">{item.durationText}</div>}
            </div>
          </div>

          <p className="shop-item-desc">{item.description}</p>

          <div className="shop-item-foot">
            <div className="shop-price">
              <b className="tabular">{item.priceRub} ₽</b>
              <span className="tabular">или {item.priceStars} ⭐</span>
            </div>
            <button type="button" className="shop-buy-btn">
              <Wallet size={14} />
              Купить
            </button>
          </div>
        </section>
      ))}

      <div className="footer reveal" style={{ animationDelay: "0.2s" }}>
        test
      </div>
    </>
  );
}
