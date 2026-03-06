'use client'

import { Languages } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function LangToggle() {
  const { locale, setLocale } = useI18n()

  return (
    <div className="flex items-center gap-0.5 p-1 rounded-lg bg-secondary/50 border border-border/50">
      <button
        onClick={() => setLocale('en')}
        className={cn(
          "relative flex items-center justify-center px-2.5 h-8 rounded-md text-xs font-medium",
          "transition-all duration-200 ease-out",
          locale === 'en'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
        )}
      >
        EN
      </button>
      <button
        onClick={() => setLocale('zh')}
        className={cn(
          "relative flex items-center justify-center px-2.5 h-8 rounded-md text-xs font-medium",
          "transition-all duration-200 ease-out",
          locale === 'zh'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
        )}
      >
        中文
      </button>
    </div>
  )
}
