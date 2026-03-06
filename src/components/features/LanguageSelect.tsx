'use client'

import { useState, useRef, useEffect } from 'react'
import { SUPPORTED_LANGUAGES } from '@/types'
import { Globe, Check, ChevronDown } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface LanguageSelectProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function LanguageSelect({ value, onChange, disabled }: LanguageSelectProps) {
  const { t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const selectedLang = SUPPORTED_LANGUAGES.find(l => l.code === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <Globe className="h-4 w-4 text-muted-foreground" />
        {t('targetLanguage')}
      </label>
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            "flex w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-4 py-2.5 text-sm",
            "shadow-sm transition-all duration-200",
            "hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            isOpen && "ring-2 ring-ring/50 border-ring"
          )}
        >
          <span className="font-medium">{selectedLang?.name}</span>
          <ChevronDown className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )} />
        </button>
        
        {isOpen && (
          <div className="absolute z-50 mt-2 w-full rounded-xl border bg-popover shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="max-h-[300px] overflow-y-auto p-1">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = lang.code === value
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      onChange(lang.code)
                      setIsOpen(false)
                    }}
                    disabled={disabled}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                      "hover:bg-accent focus:bg-accent focus:outline-none",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                      isSelected && "bg-accent/50"
                    )}
                  >
                    <span className={cn(isSelected && "font-medium")}>
                      {lang.name}
                    </span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
