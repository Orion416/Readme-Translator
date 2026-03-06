'use client'

import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'
import { useProviders } from '@/lib/hooks/useProviders'

interface StatusIndicatorProps {
  className?: string
}

export function StatusIndicator({ className }: StatusIndicatorProps) {
  const { t } = useI18n()
  const { githubToken: hasGithubToken, isLoading } = useProviders()

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50", className)}>
        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
        <span className="text-xs text-muted-foreground">{t('checking')}</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors",
        hasGithubToken
          ? "bg-emerald-500/10 border-emerald-500/30"
          : "bg-amber-500/10 border-amber-500/30",
        className
      )}
      title={hasGithubToken ? t('githubTokenConfigured') : t('githubTokenNotConfigured')}
    >
      <div
        className={cn(
          "w-2 h-2 rounded-full",
          hasGithubToken ? "bg-emerald-500" : "bg-amber-500"
        )}
      />
      <span
        className={cn(
          "text-xs font-medium",
          hasGithubToken ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
        )}
      >
        {hasGithubToken ? t('githubReady') : t('githubLimited')}
      </span>
    </div>
  )
}
