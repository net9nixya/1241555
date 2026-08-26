"use client";

import { useEffect, useState } from "react";

// Общая обёртка-тултип: на десктопе всплывает по :hover (см. .badge-tooltip
// в globals.css), в Telegram (мобильный webview, там нет курсора) — по тапу.
// Используется и для бейджей, и для галочки верификации.
export default function TooltipWrap({
  description,
  children,
}: {
  description: string;
  children: React.ReactNode;
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
      className={`badge-tooltip-wrap ${open ? "badge-tooltip-open" : ""}`}
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
