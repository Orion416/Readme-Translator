import { NextResponse } from 'next/server'
import { isProviderConfigured, isOllamaAvailable } from '@/lib/translation/providers'
import type { LLMProvider } from '@/types'

export async function GET() {
  const providers: LLMProvider[] = ['openai', 'anthropic', 'zhipu', 'openrouter']

  const configured = providers.filter((p) => isProviderConfigured(p))

  // Check Ollama availability separately (async)
  if (await isOllamaAvailable()) {
    configured.push('ollama')
  }

  return NextResponse.json({
    providers: configured,
    githubToken: !!process.env.GITHUB_TOKEN,
  })
}
