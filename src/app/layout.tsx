import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "SKYCAST AI",
  description: "Ứng dụng thời tiết thông minh SKYCAST AI"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="bg-slate-950 text-slate-50 antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
