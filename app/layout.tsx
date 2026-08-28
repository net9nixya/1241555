import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Counter Faceit",
  description: "Counter Faceit Telegram Mini App",
};

// viewport-fit=cover обязателен, чтобы env(safe-area-inset-*) в globals.css
// (нижняя панель вкладок, отступы под шапкой) реально работал на устройствах
// с вырезами/чёлкой/home-indicator, а не всегда возвращал 0.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#07070b",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" />
      </head>
      <body>{children}</body>
    </html>
  );
}
