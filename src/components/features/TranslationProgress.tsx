'use client'

import { Progress } from '@/components/ui/progress'
import type { TranslationProgress as TranslationProgressType } from '@/types'
import { useI18n } from '@/lib/i18n'

interface TranslationProgressProps {
  progress: TranslationProgressType
}

export function TranslationProgress({ progress }: TranslationProgressProps) {
  const { t } = useI18n()
  const percentage = progress.total > 0 ? (progress.current / progress.total) * 100 : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {t('translating')}... {progress.current}/{progress.total}
        </span>
        {progress.currentChunk && (
          <span className="text-muted-foreground truncate max-w-[200px]">
            {progress.currentChunk}
          </span>
        )}
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  )
}
