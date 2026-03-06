'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Copy, Check } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface ExportButtonsProps {
  content: string
  filename?: string
  disabled?: boolean
}

export function ExportButtons({
  content,
  filename = 'README.zh-CN.md',
  disabled,
}: ExportButtonsProps) {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={handleDownload}
        disabled={disabled || !content}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        {t('download')} {filename}
      </Button>
      <Button
        variant="outline"
        onClick={handleCopy}
        disabled={disabled || !content}
        className="flex items-center gap-2"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            {t('copied')}
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            {t('copyToClipboard')}
          </>
        )}
      </Button>
    </div>
  )
}
