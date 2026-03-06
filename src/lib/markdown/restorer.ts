import type { ProtectionMap } from '@/types'

// Regex pattern to match all placeholders
const PLACEHOLDER_PATTERN = /<<(CODE_BLOCK|INLINE_CODE|HTML_BLOCK|BADGE|URL)_\d+>>/g

/**
 * Restore protected content in translated markdown
 */
export function restoreMarkdown(
  translatedText: string,
  protectionMap: ProtectionMap
): string {
  let result = translatedText

  // Replace each placeholder with its original content
  for (const [placeholder, originalContent] of protectionMap) {
    // Use split and join for safe replacement (handles special regex chars)
    result = result.split(placeholder).join(originalContent)
  }

  // Clean up any potential double newlines around placeholders
  result = result.replace(/\n{3,}/g, '\n\n')

  return result
}

/**
 * Check if translated text still contains all placeholders
 */
export function validatePlaceholders(
  translatedText: string,
  protectionMap: ProtectionMap
): {
  isValid: boolean
  missing: string[]
  extra: string[]
} {
  const expectedPlaceholders = new Set(protectionMap.keys())
  const foundPlaceholders = new Set<string>()

  // Find all placeholders in translated text
  const matches = translatedText.matchAll(PLACEHOLDER_PATTERN)
  for (const match of matches) {
    foundPlaceholders.add(match[0])
  }

  // Find missing placeholders
  const missing: string[] = []
  for (const expected of expectedPlaceholders) {
    if (!foundPlaceholders.has(expected)) {
      missing.push(expected)
    }
  }

  // Find extra placeholders (shouldn't exist)
  const extra: string[] = []
  for (const found of foundPlaceholders) {
    if (!expectedPlaceholders.has(found)) {
      extra.push(found)
    }
  }

  return {
    isValid: missing.length === 0 && extra.length === 0,
    missing,
    extra,
  }
}

/**
 * Count placeholders in text
 */
export function countPlaceholders(text: string): number {
  const matches = text.match(PLACEHOLDER_PATTERN)
  return matches ? matches.length : 0
}
