import type { Metadata, Viewport } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "CAR QUIZ RACE — Závod začíná",
  description: "Závodní kvíz pro všechny, kdo milují auta. Odpovídej, získávej body a dostaň se na vrchol leaderboardu.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#080a0d",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="cs"><body>{children}</body></html>
}
