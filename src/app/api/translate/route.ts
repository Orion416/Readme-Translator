import { NextRequest, NextResponse } from 'next/server'
import { translateMarkdown } from '@/lib/translation/engine'
import type { LLMProvider } from '@/types'

export const maxDuration = 300 // 5 minutes for long translations

/**
 * Safely encode data for SSE transmission
 */
function encodeSSE(type: string, data: unknown): string {
  return `data: ${JSON.stringify({ type, data })}\n\n`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, targetLang, provider, model } = body

    console.log(`\n${'='.repeat(60)}`)
    console.log(`TRANSLATE API REQUEST`)
    console.log(`${'='.repeat(60)}`)
    console.log(`Provider: ${provider}`)
    console.log(`Model: ${model}`)
    console.log(`Target: ${targetLang}`)
    console.log(`Content length: ${content?.length || 0} chars`)

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    if (!targetLang || typeof targetLang !== 'string') {
      return NextResponse.json(
        { error: 'Target language is required' },
        { status: 400 }
      )
    }

    if (!provider || !['openai', 'anthropic', 'ollama', 'zhipu', 'openrouter'].includes(provider)) {
      return NextResponse.json(
        { error: 'Valid provider is required (openai, anthropic, ollama, zhipu, openrouter)' },
        { status: 400 }
      )
    }

    if (!model || typeof model !== 'string') {
      return NextResponse.json(
        { error: 'Model is required' },
        { status: 400 }
      )
    }

    // Create a streaming response
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const translated = await translateMarkdown(content, {
            provider: provider as LLMProvider,
            model,
            targetLang,
            onProgress: (current, total, heading) => {
              const message = encodeSSE('progress', { current, total, heading })
              controller.enqueue(encoder.encode(message))
            },
          })

          // Send final result - properly escape the content
          const message = encodeSSE('complete', { content: translated })
          console.log(`\nSending complete response (${translated.length} chars)`)
          controller.enqueue(encoder.encode(message))
          controller.close()
        } catch (error) {
          console.error('Translation stream error:', error)
          const errorMessage = error instanceof Error ? error.message : 'Translation failed'
          const message = encodeSSE('error', { message: errorMessage })
          controller.enqueue(encoder.encode(message))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Translation API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Translation failed' },
      { status: 500 }
    )
  }
}
