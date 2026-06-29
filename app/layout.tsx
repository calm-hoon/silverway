import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SilverWay",
  description: "공공데이터와 AI로 부모님 이동을 함께 결정하는 서비스",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
