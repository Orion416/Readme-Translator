// GitHub types
export interface GitHubUrlInfo {
  owner: string
  repo: string
  path?: string
  branch?: string
}

export interface FetchResult {
  content: string
  filename: string
  source: 'github' | 'paste'
}

// Markdown protection types
export type ProtectionMap = Map<string, string>

export interface ProtectionResult {
  protectedText: string
  protectionMap: ProtectionMap
}

export interface MarkdownChunk {
  id: number
  content: string
  heading?: string
  level?: number
}

// Translation types
export type LLMProvider = 'openai' | 'anthropic' | 'ollama' | 'zhipu' | 'openrouter'

export interface TranslationOptions {
  provider: LLMProvider
  model: string
  targetLang: string
}

export interface TranslationProgress {
  current: number
  total: number
  currentChunk?: string
}

// Validation types
export interface StructureMetrics {
  headingCount: number
  headingLevels: number[]
  codeBlockCount: number
  linkCount: number
  imageCount: number
  tableCount: number
  tableColumns: number[]
}

export interface ValidationResult {
  isValid: boolean
  original: StructureMetrics
  translated: StructureMetrics
  differences: string[]
}

// UI state types
export type InputMode = 'url' | 'paste'

export interface AppState {
  inputMode: InputMode
  inputText: string
  originalContent: string
  translatedContent: string
  targetLang: string
  provider: LLMProvider
  model: string
  isFetching: boolean
  isTranslating: boolean
  translationProgress: TranslationProgress
  validationResult: ValidationResult | null
  error: string | null
}

// Language options
export const SUPPORTED_LANGUAGES = [
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', name: '繁體中文', flag: '🇹🇼' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
] as const

// Provider options
export const LLM_PROVIDERS: Record<LLMProvider, { name: string; models: string[] }> = {
  openai: {
    name: 'OpenAI',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  },
  anthropic: {
    name: 'Anthropic',
    models: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
  },
  ollama: {
    name: 'Ollama (Local)',
    models: ['llama3.2', 'llama3.1', 'qwen2.5', 'gemma2', 'mistral'],
  },
  zhipu: {
    name: '智谱AI (GLM)',
    models: ['glm-4-plus', 'glm-4-0520', 'glm-4', 'glm-4-air', 'glm-4-airx', 'glm-4-flash'],
  },
  openrouter: {
    name: 'OpenRouter',
    models: [
      'openai/gpt-4o',
      'openai/gpt-4o-mini',
      'anthropic/claude-3.5-sonnet',
      'anthropic/claude-3-haiku',
      'google/gemini-pro-1.5',
      'meta-llama/llama-3.1-70b-instruct',
      'deepseek/deepseek-chat',
      'qwen/qwen-2.5-72b-instruct',
    ],
  },
}
