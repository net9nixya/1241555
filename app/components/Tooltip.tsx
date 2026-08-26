"use client";

import { useEffect, useState } from "react";

// Общая обёртка-тултип: на десктопе всплывает по :hover (см. .badge-tooltip
// в globals.css), в Telegram (мобильный webview, там нет курсора) — по тапу.
// Используется и для бейджей, и для галочки верификации.
export default function TooltipWrap({
  description,
  children,
  placement = "top",
}: {
  description: string;
  children: React.ReactNode;
  // "top" — подсказка всплывает над элементом (по умолчанию, как у бейджей).
  // "bottom" — под элементом; нужно там, где сверху мало места и подсказку
  // иначе обрежет overflow:hidden родителя (например, шапка профиля).
  placement?: "top" | "bottom";
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  return (
    <span
      className={`badge-tooltip-wrap ${placement === "bottom" ? "badge-tooltip-below" : ""} ${open ? "badge-tooltip-open" : ""}`}
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        setOpen((v) => !v);
      }}
    >
      {children}
      <span className="badge-tooltip">{description}</span>
    </span>
  );
}
