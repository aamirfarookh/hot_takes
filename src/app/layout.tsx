import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hot Takes — Wardrobe Allocation Challenge",
  description: "Behavioural trade-off simulation with real-time telemetry",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-zinc-950 text-zinc-100 antialiased font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
