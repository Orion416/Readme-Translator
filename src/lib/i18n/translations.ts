export type Locale = 'en' | 'zh'

export const translations = {
  en: {
    // Header
    title: 'README Translator',
    subtitle: 'AI-powered translation preserving markdown structure',
    
    // Input
    input: 'Input',
    githubUrl: 'GitHub / Gitee URL',
    pasteText: 'Paste Text',
    fetch: 'Fetch',
    fetching: 'Fetching...',
    urlPlaceholder: 'https://github.com/owner/repo or https://gitee.com/owner/repo',
    urlHint: 'Enter a GitHub or Gitee repository URL, or a direct link to a README file',
    pastePlaceholder: 'Paste your Markdown content here...',
    pasteHint: 'Paste your Markdown content directly for translation',
    
    // Language
    targetLanguage: 'Target Language',
    
    // Provider
    llmProvider: 'LLM Provider',
    model: 'Model',
    customModel: 'Custom Model',
    usePresets: 'Use Presets',
    active: 'Active',
    ready: 'Ready',
    providerNotConfigured: 'This provider is not configured. Set the API key in your environment variables.',
    noProviderConfigured: 'No LLM providers configured. Please set up at least one provider in your',
    envFile: 'file',
    
    // Translate
    translateWithAI: 'Translate with AI',
    translating: 'Translating...',
    
    // Preview
    original: 'Original',
    translated: 'Translated',
    
    // Export
    export: 'Export',
    download: 'Download',
    copyToClipboard: 'Copy to Clipboard',
    copied: 'Copied!',
    
    // Validation
    structureValidation: 'Structure Validation',
    passed: 'Passed',
    headingCount: 'Headings',
    codeBlockCount: 'Code Blocks',
    linkCount: 'Links',
    imageCount: 'Images',
    tableCount: 'Tables',
    
    // Progress
    translatingProgress: 'Translating',
    
    // Footer
    poweredByAI: 'Powered by AI',
    
    // Theme
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    
    // Language Switch
    language: 'Language',
    
    // Error
    error: 'Error',

    // Status
    checking: 'Checking...',
    githubReady: 'GitHub Ready',
    githubLimited: 'GitHub Limited',
    githubTokenConfigured: 'GitHub Token is configured',
    githubTokenNotConfigured: 'GitHub Token not configured. Rate limits may apply.',
  },
  zh: {
    // Header
    title: 'README 翻译器',
    subtitle: 'AI 驱动的 Markdown 翻译，保留文档结构',
    
    // Input
    input: '输入',
    githubUrl: 'GitHub / Gitee 链接',
    pasteText: '粘贴文本',
    fetch: '获取',
    fetching: '获取中...',
    urlPlaceholder: 'https://github.com/owner/repo 或 https://gitee.com/owner/repo',
    urlHint: '输入 GitHub 或 Gitee 仓库链接，或 README 文件直接链接',
    pastePlaceholder: '在此粘贴 Markdown 内容...',
    pasteHint: '直接粘贴 Markdown 内容进行翻译',
    
    // Language
    targetLanguage: '目标语言',
    
    // Provider
    llmProvider: 'LLM 提供商',
    model: '模型',
    customModel: '自定义模型',
    usePresets: '使用预设',
    active: '当前',
    ready: '可用',
    providerNotConfigured: '此提供商未配置。请在环境变量中设置 API 密钥。',
    noProviderConfigured: '未配置 LLM 提供商。请在',
    envFile: '文件',
    
    // Translate
    translateWithAI: 'AI 翻译',
    translating: '翻译中...',
    
    // Preview
    original: '原文',
    translated: '译文',
    
    // Export
    export: '导出',
    download: '下载',
    copyToClipboard: '复制到剪贴板',
    copied: '已复制！',
    
    // Validation
    structureValidation: '结构验证',
    passed: '通过',
    headingCount: '标题',
    codeBlockCount: '代码块',
    linkCount: '链接',
    imageCount: '图片',
    tableCount: '表格',
    
    // Progress
    translatingProgress: '翻译中',
    
    // Footer
    poweredByAI: '由 AI 驱动',
    
    // Theme
    light: '浅色',
    dark: '深色',
    system: '跟随系统',
    
    // Language Switch
    language: '语言',
    
    // Error
    error: '错误',

    // Status
    checking: '检查中...',
    githubReady: 'GitHub 就绪',
    githubLimited: 'GitHub 受限',
    githubTokenConfigured: '已配置 GitHub Token',
    githubTokenNotConfigured: '未配置 GitHub Token，可能受到速率限制',
  },
} as const

export type TranslationKey = keyof typeof translations.en
