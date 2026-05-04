import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SilverWay",
  description: "AI 기반 고령자 이동 및 면허 반납 의사결정 지원 서비스",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
