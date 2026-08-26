"use client";

import { UserRoundPlus } from "lucide-react";

// Ссылка на бота — берётся через env на билде (NEXT_PUBLIC_*, т.к. это
// читается в браузере), с фолбэком на дефолтного бота проекта.
const BOT_LINK = process.env.NEXT_PUBLIC_BOT_LINK || "https://t.me/Counterfaceit_bot";

export default function RegisterGate() {
  return (
    <div className="gate-screen">
      <section className="card gate-card">
        <div className="gate-icon">
          <UserRoundPlus size={30} />
        </div>
        <div className="gate-title">Ты ещё не зарегистрирован</div>
        <p className="gate-sub">
          Чтобы открыть профиль, топы и задания, сначала зарегистрируйся в боте Counter Faceit — это займёт меньше минуты.
        </p>
        <a className="gate-btn" href={BOT_LINK} target="_blank" rel="noreferrer">
          <UserRoundPlus size={16} />
          Открыть бота и зарегистрироваться
        </a>
      </section>
    </div>
  );
}
