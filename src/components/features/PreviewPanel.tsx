'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/lib/i18n'
import 'highlight.js/styles/github-dark.css'

interface PreviewPanelProps {
  original: string
  translated: string
  isTranslating: boolean
}

export function PreviewPanel({
  original,
  translated,
  isTranslating,
}: PreviewPanelProps) {
  const { t, locale } = useI18n()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Original Panel */}
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t('original')}</CardTitle>
        </CardHeader>
        <CardContent>
          {original ? (
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
                {original}
              </ReactMarkdown>
            </div>
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
          <CardTitle className="text-lg">{t('translated')}</CardTitle>
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
                {translated}
              </ReactMarkdown>
            </div>
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
