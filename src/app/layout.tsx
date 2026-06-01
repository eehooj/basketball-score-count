import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "농구 점수판 (Basketball Score Counter)",
  description: "실시간 농구 점수판 - 패드 및 스마트폰용",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body style={{ minHeight: "100vh" }}>{children}</body>
    </html>
  );
}
