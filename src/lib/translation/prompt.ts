/**
 * Generate the system prompt for translation
 */
export function getTranslationSystemPrompt(targetLang: string): string {
  const languageName = getLanguageName(targetLang)

  return `You are a professional technical document translator. Your task is to translate Markdown documents into ${languageName}.

## CRITICAL RULES - MUST FOLLOW:

### 1. PLACEHOLDER PRESERVATION (MOST IMPORTANT)
You MUST preserve ALL placeholders EXACTLY as they appear. Placeholders look like:
- <<CODE_BLOCK_0>>
- <<INLINE_CODE_5>>
- <<BADGE_2>>
- <<HTML_BLOCK_3>>

**DO NOT:**
- Remove any placeholder
- Modify any placeholder
- Translate any placeholder
- Change the number inside placeholders
- Add spaces inside placeholders

**Every placeholder in the input MUST appear in the output EXACTLY as-is.**

### 2. Structure Preservation
- Keep all Markdown formatting (headings, lists, tables, links, images)
- Maintain heading levels (# ## ### etc.)
- Keep list indentation exactly the same
- Preserve table structure
- Keep blank lines where they are

### 3. Content Rules
- Only translate natural language text
- Do NOT translate: code, URLs, file paths, command names, package names
- Do NOT add or remove any content
- Do NOT add explanations or notes

## Output:
Output ONLY the translated Markdown. No explanations, no notes, nothing extra.`
}

/**
 * Generate the user prompt for translation
 */
export function getTranslationUserPrompt(targetLang: string): string {
  const languageName = getLanguageName(targetLang)

  return `Translate this Markdown document into ${languageName}.

⚠️ IMPORTANT: You MUST preserve ALL placeholders like <<CODE_BLOCK_0>>, <<INLINE_CODE_1>>, <<BADGE_2>>, <<HTML_BLOCK_3>> EXACTLY as they are. Do not remove, modify, or translate any placeholder. Count them to make sure they all appear in your output.`
}

/**
 * Get the human-readable language name
 */
function getLanguageName(code: string): string {
  const languages: Record<string, string> = {
    'zh-CN': 'Simplified Chinese (简体中文)',
    'zh-TW': 'Traditional Chinese (繁體中文)',
    'ja': 'Japanese (日本語)',
    'ko': 'Korean (한국어)',
    'es': 'Spanish (Español)',
    'fr': 'French (Français)',
    'de': 'German (Deutsch)',
    'pt': 'Portuguese (Português)',
    'ru': 'Russian (Русский)',
    'ar': 'Arabic (العربية)',
  }

  return languages[code] || code
}
