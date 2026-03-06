'use client'

import { Moon, Sun, Monitor, Languages } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { t } = useI18n()

  const themes = [
    { value: 'light', icon: Sun, label: t('light') },
    { value: 'dark', icon: Moon, label: t('dark') },
    { value: 'system', icon: Monitor, label: t('system') },
  ] as const

  return (
    <div className="flex items-center gap-0.5 p-1 rounded-lg bg-secondary/50 border border-border/50">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            "relative flex items-center justify-center w-8 h-8 rounded-md",
            "transition-all duration-200 ease-out",
            theme === value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          )}
          aria-label={`Switch to ${label} theme`}
          title={label}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  )
}
