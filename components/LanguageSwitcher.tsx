"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "zh", name: "中文" },
]

export default function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()

  const handleLanguageChange = (langCode: string) => {
    // Extract the current language from the pathname
    const segments = pathname.split("/")
    const currentLang = segments[1]

    // Replace the language segment with the new language
    const newPathname = pathname.replace(`/${currentLang}`, `/${langCode}`)
    router.push(newPathname)
  }

  // Get current language from pathname
  const currentLang = pathname.split("/")[1] || "en"
  const currentLanguage = LANGUAGES.find((lang) => lang.code === currentLang)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Globe className="h-4 w-4" />
          {currentLanguage?.name || "Language"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={currentLang === lang.code ? "bg-accent" : ""}
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
