'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, Languages, AlertCircle, Sparkles } from 'lucide-react'

import { InputPanel } from '@/components/features/InputPanel'
import { LanguageSelect } from '@/components/features/LanguageSelect'
import { ProviderSelect } from '@/components/features/ProviderSelect'
import { PreviewPanel } from '@/components/features/PreviewPanel'
import { ExportButtons } from '@/components/features/ExportButtons'
import { StructureReport } from '@/components/features/StructureReport'
import { TranslationProgress } from '@/components/features/TranslationProgress'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { LangToggle } from '@/components/layout/LangToggle'
import { StatusIndicator } from '@/components/layout/StatusIndicator'

import type { InputMode, LLMProvider, ValidationResult, TranslationProgress as TranslationProgressType } from '@/types'
import { getDefaultModel } from '@/lib/translation/providers'
import { useI18n } from '@/lib/i18n'

export default function Home() {
  const { t } = useI18n()
  
  // Input state
  const [inputMode, setInputMode] = useState<InputMode>('url')
  const [inputText, setInputText] = useState('')
  const [originalContent, setOriginalContent] = useState('')
  const [translatedContent, setTranslatedContent] = useState('')

  // Translation options
  const [targetLang, setTargetLang] = useState('zh-CN')
  const [provider, setProvider] = useState<LLMProvider>('openai')
  const [model, setModel] = useState(getDefaultModel('openai'))

  // UI state
  const [isFetching, setIsFetching] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [translationProgress, setTranslationProgress] = useState<TranslationProgressType>({
    current: 0,
    total: 0,
  })
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch README from GitHub
  const handleFetch = useCallback(async () => {
    setError(null)
    setIsFetching(true)
    setOriginalContent('')
    setTranslatedContent('')
    setValidationResult(null)

    try {
      const response = await fetch('/api/fetch-readme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: inputText,
          mode: inputMode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch content')
      }

      setOriginalContent(data.content)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch content')
    } finally {
      setIsFetching(false)
    }
  }, [inputText, inputMode])

  // Handle translate
  const handleTranslate = useCallback(async () => {
    // If in paste mode, use inputText as original content
    const contentToTranslate = inputMode === 'paste' ? inputText : originalContent

    if (!contentToTranslate.trim()) {
      setError('No content to translate')
      return
    }

    setError(null)
    setIsTranslating(true)
    setTranslatedContent('')
    setValidationResult(null)
    setTranslationProgress({ current: 0, total: 0 })

    // If in paste mode, set original content
    if (inputMode === 'paste') {
      setOriginalContent(contentToTranslate)
    }

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: contentToTranslate,
          targetLang,
          provider,
          model,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Translation failed')
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response stream')
      }

      let buffer = '' // Buffer for incomplete lines
      let finalTranslatedContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')

        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim()
            if (!jsonStr) continue

            try {
              const data = JSON.parse(jsonStr)

              if (data.type === 'progress') {
                setTranslationProgress({
                  current: data.data.current,
                  total: data.data.total,
                  currentChunk: data.data.heading,
                })
              } else if (data.type === 'chunk') {
                finalTranslatedContent += data.data.content + '\n\n'
                setTranslatedContent(finalTranslatedContent.trim())
              } else if (data.type === 'complete') {
                finalTranslatedContent = data.data.content
                setTranslatedContent(finalTranslatedContent)
              } else if (data.type === 'error') {
                throw new Error(data.data.message)
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', jsonStr.substring(0, 100))
            }
          }
        }
      }

      // Process any remaining buffer
      if (buffer.startsWith('data: ')) {
        const jsonStr = buffer.slice(6).trim()
        if (jsonStr) {
          try {
            const data = JSON.parse(jsonStr)
            if (data.type === 'complete') {
              finalTranslatedContent = data.data.content
              setTranslatedContent(finalTranslatedContent)
            } else if (data.type === 'error') {
              throw new Error(data.data.message)
            }
          } catch (parseError) {
            console.warn('Failed to parse remaining buffer:', jsonStr.substring(0, 100))
          }
        }
      }

      // Validate structure after translation
      if (finalTranslatedContent) {
        try {
          const validateResponse = await fetch('/api/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              original: contentToTranslate,
              translated: finalTranslatedContent,
            }),
          })

          if (validateResponse.ok) {
            const validateData = await validateResponse.json()
            setValidationResult(validateData)
          }
        } catch (validateError) {
          console.warn('Validation failed:', validateError)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed')
    } finally {
      setIsTranslating(false)
      setTranslationProgress({ current: 0, total: 0 })
    }
  }, [inputMode, inputText, originalContent, targetLang, provider, model])

  // Get filename for export
  const getExportFilename = () => {
    const langSuffix = targetLang.toLowerCase()
    return `README.${langSuffix}.md`
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-gradient-to-b from-accent/30 to-transparent shrink-0">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
                <Languages className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  <span className="gradient-text">{t('title')}</span>
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t('subtitle')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusIndicator />
              <LangToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('error') || 'Error'}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Input Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{t('input')}</CardTitle>
          </CardHeader>
          <CardContent>
            <InputPanel
              inputMode={inputMode}
              setInputMode={setInputMode}
              inputText={inputText}
              setInputText={setInputText}
              onFetch={handleFetch}
              isFetching={isFetching}
              disabled={isTranslating}
            />
          </CardContent>
        </Card>

        {/* Translation Options */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-1">
            <CardContent className="pt-6">
              <LanguageSelect
                value={targetLang}
                onChange={setTargetLang}
                disabled={isTranslating}
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardContent className="pt-6">
              <ProviderSelect
                provider={provider}
                model={model}
                onProviderChange={setProvider}
                onModelChange={setModel}
                disabled={isTranslating}
              />
            </CardContent>
          </Card>
        </div>

        {/* Translate Button */}
        <div className="flex justify-center py-2">
          <Button
            size="lg"
            onClick={handleTranslate}
            disabled={
              isTranslating ||
              isFetching ||
              (inputMode === 'url' && !originalContent) ||
              (inputMode === 'paste' && !inputText.trim())
            }
            className="min-w-[220px] h-12 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200"
          >
            {isTranslating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t('translating')}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                {t('translateWithAI')}
              </>
            )}
          </Button>
        </div>

        {/* Translation Progress */}
        {isTranslating && translationProgress.total > 0 && (
          <Card>
            <CardContent className="pt-6">
              <TranslationProgress progress={translationProgress} />
            </CardContent>
          </Card>
        )}

        {/* Preview Section */}
        {(originalContent || translatedContent) && (
          <PreviewPanel
            original={originalContent}
            translated={translatedContent}
            isTranslating={isTranslating}
          />
        )}

        {/* Structure Validation */}
        {validationResult && (
          <StructureReport result={validationResult} />
        )}

        {/* Export Section */}
        {translatedContent && !isTranslating && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{t('export')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ExportButtons
                content={translatedContent}
                filename={getExportFilename()}
              />
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 shrink-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>README Translator</span>
            <span className="text-border">·</span>
            <span>{t('poweredByAI')}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
