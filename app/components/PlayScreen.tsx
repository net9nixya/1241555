"use client";

import { Play } from "lucide-react";

export default function PlayScreen() {
  return (
    <>
      <h1 className="brand-title reveal">Играть</h1>
      <section className="card placeholder-card reveal" style={{ animationDelay: "0.06s" }}>
        <div className="placeholder-icon">
          <Play size={24} />
        </div>
        <div className="placeholder-title">Поиск матча скоро будет здесь</div>
        <p className="placeholder-sub">.</p>
      </section>
    </>
  );
}
