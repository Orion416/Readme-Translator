'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { LLM_PROVIDERS, type LLMProvider } from '@/types'
import { getDefaultModel } from '@/lib/translation/providers'
import { Check, Pencil, Zap, ChevronDown } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useProviders } from '@/lib/hooks/useProviders'

interface ProviderSelectProps {
  provider: LLMProvider
  model: string
  onProviderChange: (provider: LLMProvider) => void
  onModelChange: (model: string) => void
  disabled?: boolean
}

export function ProviderSelect({
  provider,
  model,
  onProviderChange,
  onModelChange,
  disabled,
}: ProviderSelectProps) {
  const { t, locale } = useI18n()
  const { providers: configuredProviders, isLoading } = useProviders()
  const [useCustomModel, setUseCustomModel] = useState(false)
  const [providerOpen, setProviderOpen] = useState(false)
  const [modelOpen, setModelOpen] = useState(false)
  const providerRef = useRef<HTMLDivElement>(null)
  const modelRef = useRef<HTMLDivElement>(null)

  // Auto-select first configured provider if current one isn't available
  useEffect(() => {
    if (!isLoading && configuredProviders.length > 0 && !configuredProviders.includes(provider)) {
      onProviderChange(configuredProviders[0])
      onModelChange(getDefaultModel(configuredProviders[0]))
    }
  }, [configuredProviders, isLoading, provider, onProviderChange, onModelChange])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (providerRef.current && !providerRef.current.contains(event.target as Node)) {
        setProviderOpen(false)
      }
      if (modelRef.current && !modelRef.current.contains(event.target as Node)) {
        setModelOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentProviderConfig = LLM_PROVIDERS[provider]
  const hasPresetModels = currentProviderConfig?.models.length > 0

  useEffect(() => {
    if (!hasPresetModels && !useCustomModel) {
      setUseCustomModel(true)
    }
  }, [hasPresetModels, useCustomModel])

  const isConfigured = configuredProviders.includes(provider)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Provider Select */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            {t('llmProvider')}
          </label>
          <div ref={providerRef} className="relative">
            <button
              type="button"
              onClick={() => !disabled && !isLoading && setProviderOpen(!providerOpen)}
              disabled={disabled || isLoading}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-4 py-2.5 text-sm",
                "shadow-sm transition-all duration-200",
                "hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring",
                "disabled:cursor-not-allowed disabled:opacity-50",
                providerOpen && "ring-2 ring-ring/50 border-ring"
              )}
            >
              <span className="flex items-center gap-2">
                <span>{currentProviderConfig?.name || provider}</span>
                {isConfigured && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </span>
              <ChevronDown className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                providerOpen && "rotate-180"
              )} />
            </button>
            
            {providerOpen && (
              <div className="absolute z-50 mt-2 w-full rounded-xl border bg-popover shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
                <div className="max-h-[300px] overflow-y-auto p-1">
                  {Object.entries(LLM_PROVIDERS).map(([key, config]) => {
                    const isProviderConfigured = configuredProviders.includes(key as LLMProvider)
                    const isSelected = key === provider
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          if (isProviderConfigured) {
                            onProviderChange(key as LLMProvider)
                            onModelChange(getDefaultModel(key as LLMProvider))
                            setUseCustomModel(false)
                            setProviderOpen(false)
                          }
                        }}
                        disabled={!isProviderConfigured}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                          "hover:bg-accent focus:bg-accent focus:outline-none",
                          "disabled:cursor-not-allowed disabled:opacity-50",
                          isSelected && "bg-accent/50"
                        )}
                      >
                        <span className={isProviderConfigured ? 'text-foreground' : 'text-muted-foreground'}>
                          {config.name}
                        </span>
                        {isProviderConfigured && (
                          <span className={cn(
                            "text-xs font-medium shrink-0",
                            isSelected ? "text-primary" : "text-muted-foreground"
                          )}>
                            {isSelected ? t('active') : t('ready')}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Model Select/Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">{t('model')}</label>
            {hasPresetModels && (
              <button
                type="button"
                onClick={() => setUseCustomModel(!useCustomModel)}
                className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
                {useCustomModel ? t('usePresets') : t('customModel')}
              </button>
            )}
          </div>

          {useCustomModel || !hasPresetModels ? (
            <Input
              placeholder="e.g., gpt-4o, claude-3-5-sonnet"
              value={model}
              onChange={(e) => onModelChange(e.target.value)}
              disabled={disabled}
              className="font-mono text-sm h-10"
            />
          ) : (
            <div ref={modelRef} className="relative">
              <button
                type="button"
                onClick={() => !disabled && setModelOpen(!modelOpen)}
                disabled={disabled}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-4 py-2.5 text-sm",
                  "shadow-sm transition-all duration-200",
                  "hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  modelOpen && "ring-2 ring-ring/50 border-ring"
                )}
              >
                <span className="font-mono text-sm">{model}</span>
                <ChevronDown className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  modelOpen && "rotate-180"
                )} />
              </button>
              
              {modelOpen && (
                <div className="absolute z-50 mt-2 w-full rounded-xl border bg-popover shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
                  <div className="max-h-[300px] overflow-y-auto p-1">
                    {currentProviderConfig?.models.map((modelName) => {
                      const isSelected = modelName === model
                      return (
                        <button
                          key={modelName}
                          type="button"
                          onClick={() => {
                            onModelChange(modelName)
                            setModelOpen(false)
                          }}
                          disabled={disabled}
                          className={cn(
                            "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                            "hover:bg-accent focus:bg-accent focus:outline-none",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            isSelected && "bg-accent/50"
                          )}
                        >
                          <span className={cn("font-mono", isSelected && "font-medium")}>
                            {modelName}
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
          )}
        </div>
      </div>

      {/* Warning for unconfigured providers */}
      {!isConfigured && !isLoading && configuredProviders.length > 0 && (
        <div className="text-sm text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 rounded-lg border border-amber-200 dark:border-amber-800">
          {t('providerNotConfigured')}
        </div>
      )}

      {/* Error for no providers */}
      {configuredProviders.length === 0 && !isLoading && (
        <div className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg border border-destructive/20">
          {t('noProviderConfigured')} <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">.env.local</code> {locale === 'zh' ? '中配置。' : 'file.'}
        </div>
      )}
    </div>
  )
}
