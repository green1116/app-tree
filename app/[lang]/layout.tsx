import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "../globals.css"
import LanguageSwitcher from "@/components/LanguageSwitcher"

export const metadata: Metadata = {
  title: "Multi-Language App",
  description: "Created with v0 - Multi-language support",
  generator: "v0.app",
}

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "zh" }]
}

export default async function RootLayout({ children, params }: LayoutProps) {
  const { lang } = await params

  return (
    <html lang={lang}>
      <body className="font-sans antialiased">
        <header className="border-b border-border bg-background">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <h1 className="text-2xl font-bold">My App</h1>
            <LanguageSwitcher />
          </div>
        </header>
        <main className="min-h-screen">{children}</main>
        <Analytics />
      </body>
    </html>
  )
}
