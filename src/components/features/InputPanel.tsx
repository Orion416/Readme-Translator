'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2, Download, FileText } from 'lucide-react'
import type { InputMode } from '@/types'
import { useI18n } from '@/lib/i18n'

interface InputPanelProps {
  inputMode: InputMode
  setInputMode: (mode: InputMode) => void
  inputText: string
  setInputText: (text: string) => void
  onFetch: () => void
  isFetching: boolean
  disabled: boolean
}

export function InputPanel({
  inputMode,
  setInputMode,
  inputText,
  setInputText,
  onFetch,
  isFetching,
  disabled,
}: InputPanelProps) {
  const { t } = useI18n()

  return (
    <div className="space-y-4">
      <Tabs
        value={inputMode}
        onValueChange={(v) => setInputMode(v as InputMode)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="url" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            {t('githubUrl')}
          </TabsTrigger>
          <TabsTrigger value="paste" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t('pasteText')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder={t('urlPlaceholder')}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={disabled || isFetching}
              className="flex-1"
            />
            <Button onClick={onFetch} disabled={disabled || isFetching || !inputText.trim()}>
              {isFetching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('fetching')}
                </>
              ) : (
                t('fetch')
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('urlHint')}
          </p>
        </TabsContent>

        <TabsContent value="paste" className="space-y-4">
          <Textarea
            placeholder={t('pastePlaceholder')}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={disabled}
            className="min-h-[200px] font-mono text-sm"
          />
          <p className="text-sm text-muted-foreground">
            {t('pasteHint')}
          </p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
