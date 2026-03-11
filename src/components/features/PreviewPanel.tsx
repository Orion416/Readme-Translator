'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { Eye, Code2 } from 'lucide-react'
import 'highlight.js/styles/github-dark.css'

type ViewMode = 'preview' | 'source'

interface PreviewPanelProps {
  original: string
  translated: string
  isTranslating: boolean
}

function ViewModeToggle({
  mode,
  onChange,
}: {
  mode: ViewMode
  onChange: (mode: ViewMode) => void
}) {
  return (
    <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
      <button
        onClick={() => onChange('preview')}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all',
          mode === 'preview'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Eye className="h-3.5 w-3.5" />
        Preview
      </button>
      <button
        onClick={() => onChange('source')}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all',
          mode === 'source'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Code2 className="h-3.5 w-3.5" />
        Markdown
      </button>
    </div>
  )
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none overflow-auto max-h-[600px]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          pre: ({ children }) => (
            <pre className="overflow-x-auto">{children}</pre>
          ),
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '')
            return match ? (
              <code className={className} {...props}>
                {children}
              </code>
            ) : (
              <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props}>
                {children}
              </code>
            )
          },
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={alt}
              className="max-w-full h-auto"
              loading="lazy"
            />
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

function SourceContent({ content }: { content: string }) {
  return (
    <pre className="overflow-auto max-h-[600px] text-sm font-mono bg-muted/30 p-4 rounded-lg whitespace-pre-wrap break-words">
      {content}
    </pre>
  )
}

export function PreviewPanel({
  original,
  translated,
  isTranslating,
}: PreviewPanelProps) {
  const { t, locale } = useI18n()
  const [originalMode, setOriginalMode] = useState<ViewMode>('preview')
  const [translatedMode, setTranslatedMode] = useState<ViewMode>('preview')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Original Panel */}
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{t('original')}</CardTitle>
            <ViewModeToggle mode={originalMode} onChange={setOriginalMode} />
          </div>
        </CardHeader>
        <CardContent>
          {original ? (
            originalMode === 'preview' ? (
              <MarkdownContent content={original} />
            ) : (
              <SourceContent content={original} />
            )
          ) : (
            <div className="text-muted-foreground text-center py-8">
              {locale === 'zh' ? '暂无内容' : 'No content to display'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Translated Panel */}
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{t('translated')}</CardTitle>
            <ViewModeToggle mode={translatedMode} onChange={setTranslatedMode} />
          </div>
        </CardHeader>
        <CardContent>
          {isTranslating ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : translated ? (
            translatedMode === 'preview' ? (
              <MarkdownContent content={translated} />
            ) : (
              <SourceContent content={translated} />
            )
          ) : (
            <div className="text-muted-foreground text-center py-8">
              {locale === 'zh' ? '翻译结果将显示在这里' : 'Translation will appear here'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
