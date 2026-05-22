import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Basketball Score Counter",
  description: "Real-time basketball score counter for Pad and Phone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
