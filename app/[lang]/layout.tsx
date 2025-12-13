import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "../globals.css"
import NavbarSimple from "@/components/NavbarSimple"

export const metadata: Metadata = {
  title: "Multi-Language App",
  description: "Created with v0 - Multi-language support",
  generator: "v0.app",
}

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "zh" }]
}

export default async function RootLayout({ children, params }: LayoutProps) {
  const { lang } = await params

  return (
    <>
      {/* Navigation Bar */}
      <NavbarSimple lang={lang} />
      <main className="min-h-screen">{children}</main>
    </>
  )
}
