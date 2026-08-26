import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Counter Faceit",
  description: "Counter Faceit Telegram Mini App",
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
