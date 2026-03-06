'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react'
import type { ValidationResult } from '@/types'
import { useI18n } from '@/lib/i18n'

interface StructureReportProps {
  result: ValidationResult | null
  isLoading?: boolean
}

export function StructureReport({ result, isLoading }: StructureReportProps) {
  const { t, locale } = useI18n()

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t('structureValidation')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!result) {
    return null
  }

  const { isValid, original, translated, differences } = result

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t('structureValidation')}</CardTitle>
          {isValid ? (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {t('passed')}
            </Badge>
          ) : (
            <Badge variant="destructive">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {locale === 'zh' ? '发现问题' : 'Issues Found'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metrics Comparison */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground">{t('headingCount')}</p>
            <p className="font-medium">
              {original.headingCount} → {translated.headingCount}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">{t('codeBlockCount')}</p>
            <p className="font-medium">
              {original.codeBlockCount} → {translated.codeBlockCount}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">{t('linkCount')}</p>
            <p className="font-medium">
              {original.linkCount} → {translated.linkCount}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">{t('imageCount')}</p>
            <p className="font-medium">
              {original.imageCount} → {translated.imageCount}
            </p>
          </div>
        </div>

        {/* Tables info */}
        {(original.tableCount > 0 || translated.tableCount > 0) && (
          <div className="text-sm">
            <p className="text-muted-foreground">{t('tableCount')}</p>
            <p className="font-medium">
              {original.tableCount} → {translated.tableCount}
              {original.tableColumns.length > 0 && (
                <span className="text-muted-foreground ml-2">
                  ({locale === 'zh' ? '列数' : 'columns'}: {original.tableColumns.join(', ')})
                </span>
              )}
            </p>
          </div>
        )}

        {/* Differences */}
        {differences.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{locale === 'zh' ? '检测到结构差异' : 'Structural Differences Detected'}</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 space-y-1 text-sm">
                {differences.map((diff, index) => (
                  <li key={index}>• {diff}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {isValid && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>{locale === 'zh' ? '验证通过' : 'Validation Passed'}</AlertTitle>
            <AlertDescription>
              {locale === 'zh' 
                ? '翻译后的文档与原文保持相同的结构。' 
                : 'The translated document maintains the same structure as the original.'}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
