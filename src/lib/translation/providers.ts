import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { createOllama } from 'ai-sdk-ollama'
import { createZhipu } from 'zhipu-ai-provider'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import type { LLMProvider } from '@/types'

/**
 * Get the language model for a specific provider
 */
export function getModel(provider: LLMProvider, model: string) {
  switch (provider) {
    case 'openai':
      return openai(model)

    case 'anthropic':
      return anthropic(model)

    case 'ollama':
      const ollama = createOllama({
        baseURL: process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434',
      })
      return ollama(model)

    case 'zhipu':
      const zhipu = createZhipu({
        apiKey: process.env.ZHIPU_API_KEY,
      })
      return zhipu(model)

    case 'openrouter':
      const openrouter = createOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY,
      })
      return openrouter.chat(model)

    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}

/**
 * Check if a provider is configured (sync - for API key based providers)
 */
export function isProviderConfigured(provider: LLMProvider): boolean {
  switch (provider) {
    case 'openai':
      return !!process.env.OPENAI_API_KEY

    case 'anthropic':
      return !!process.env.ANTHROPIC_API_KEY

    case 'ollama':
      // Ollama needs runtime check, default to false
      return false

    case 'zhipu':
      return !!process.env.ZHIPU_API_KEY

    case 'openrouter':
      return !!process.env.OPENROUTER_API_KEY

    default:
      return false
  }
}

/**
 * Check if Ollama service is running
 */
export async function isOllamaAvailable(): Promise<boolean> {
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434'
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    const response = await fetch(`${baseUrl}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    return response.ok
  } catch {
    return false
  }
}

/**
 * Get list of configured providers (sync version, excludes Ollama)
 * Note: Use /api/providers for full async check including Ollama
 */
export function getConfiguredProviders(): LLMProvider[] {
  const providers: LLMProvider[] = []

  if (isProviderConfigured('openai')) providers.push('openai')
  if (isProviderConfigured('anthropic')) providers.push('anthropic')
  // Ollama requires async check - use /api/providers instead
  if (isProviderConfigured('zhipu')) providers.push('zhipu')
  if (isProviderConfigured('openrouter')) providers.push('openrouter')

  return providers
}

/**
 * Get default model for a provider
 */
export function getDefaultModel(provider: LLMProvider): string {
  switch (provider) {
    case 'openai':
      return 'gpt-4o-mini'

    case 'anthropic':
      return 'claude-3-5-sonnet-20241022'

    case 'ollama':
      return 'llama3.2'

    case 'zhipu':
      return 'glm-4-flash'

    case 'openrouter':
      return 'openai/gpt-4o-mini'

    default:
      return 'gpt-4o-mini'
  }
}
