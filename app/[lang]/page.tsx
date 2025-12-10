import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface HomePageProps {
  params: Promise<{ lang: string }>
}

export const metadata: Metadata = {
  title: "Home",
  description: "Home page",
}

export default async function HomePage({ params }: HomePageProps) {
  const { lang } = await params

  const links = [
    { href: `/${lang}/dashboard`, label: lang === "en" ? "Dashboard" : "仪表板" },
    { href: `/${lang}/connect`, label: lang === "en" ? "Connect" : "连接" },
    { href: `/${lang}/workout`, label: lang === "en" ? "Workout" : "健身" },
    { href: `/${lang}/courses`, label: lang === "en" ? "Courses" : "课程" },
    { href: `/${lang}/report`, label: lang === "en" ? "Report" : "报告" },
  ]

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold">{lang === "en" ? "Welcome" : "欢迎"}</h1>
        <p className="mb-12 text-lg text-muted-foreground">
          {lang === "en" ? "Navigate through the application using the menu below" : "使用下面的菜单浏览应用程序"}
        </p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button className="w-full bg-transparent" variant="outline">
                {link.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
