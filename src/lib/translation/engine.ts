import { generateText } from 'ai'
import type { LLMProvider, TranslationOptions } from '@/types'
import { getModel } from './providers'

export interface TranslateOptions extends TranslationOptions {
  onProgress?: (current: number, total: number, chunk?: string) => void
}

interface ProtectedBlock {
  placeholder: string
  original: string
}

// Split text into chunks at heading boundaries
function splitIntoChunks(text: string, maxChunkSize = 8000): string[] {
  const lines = text.split('\n')
  const chunks: string[] = []
  let currentChunk: string[] = []
  let currentSize = 0

  for (const line of lines) {
    const lineSize = line.length + 1

    // Start new chunk at H1/H2 headings if chunk is getting large
    if ((line.startsWith('# ') || line.startsWith('## ')) && currentSize > maxChunkSize * 0.3) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.join('\n'))
        currentChunk = []
        currentSize = 0
      }
    }

    // Start new chunk if size exceeded
    if (currentSize + lineSize > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.join('\n'))
      currentChunk = []
      currentSize = 0
    }

    currentChunk.push(line)
    currentSize += lineSize
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('\n'))
  }

  return chunks
}

/**
 * Protect code blocks, inline code, and citations
 */
function protectCode(text: string): { text: string; blocks: ProtectedBlock[] } {
  const blocks: ProtectedBlock[] = []
  let result = text
  let counter = 0

  // Protect fenced code blocks first
  result = result.replace(/```[\s\S]*?```/g, (match) => {
    const placeholder = `[CODE_${counter}]`
    blocks.push({ placeholder, original: match })
    counter++
    return placeholder
  })

  // Protect inline code
  result = result.replace(/`[^`\n]+`/g, (match) => {
    const placeholder = `[ICODE_${counter}]`
    blocks.push({ placeholder, original: match })
    counter++
    return placeholder
  })

  // Protect markdown links (keep them intact - translate only the link text later)
  // This preserves the full [text](url) structure
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match) => {
    const placeholder = `[LINK_${counter}]`
    blocks.push({ placeholder, original: match })
    counter++
    return placeholder
  })

  // Protect markdown images
  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match) => {
    const placeholder = `[IMG_${counter}]`
    blocks.push({ placeholder, original: match })
    counter++
    return placeholder
  })

  // Protect standalone citation references like [1], [2,3,4], [Author et al., 2020]
  // Only match if NOT followed by ( which would make it a link
  result = result.replace(/\[(\d+(?:[-,]\s*\d+)*)\](?!\()/g, (match) => {
    const placeholder = `[CITE_${counter}]`
    blocks.push({ placeholder, original: match })
    counter++
    return placeholder
  })

  // Protect academic citations like [Smith et al., 2020], [RFC 1234], etc.
  result = result.replace(/\[([A-Z][a-zA-Z]+\s+et\s+al\.?,?\s*\d{0,4}|RFC\s*\d+|DOI:?[^\]]+|arXiv:?[^\]]+)\](?!\()/gi, (match) => {
    const placeholder = `[ACITE_${counter}]`
    blocks.push({ placeholder, original: match })
    counter++
    return placeholder
  })

  return { text: result, blocks }
}

/**
 * Restore protected blocks
 */
function restoreCode(text: string, blocks: ProtectedBlock[]): string {
  let result = text
  for (let i = blocks.length - 1; i >= 0; i--) {
    result = result.replace(blocks[i].placeholder, blocks[i].original)
  }
  return result
}

/**
 * Translate a single chunk
 */
async function translateChunk(
  text: string,
  langName: string,
  model: any
): Promise<string> {
  const { text: protectedText, blocks } = protectCode(text)

  const systemPrompt = `You are a professional technical document translator. Translate the given Markdown text to ${langName}.

ABSOLUTE RULES - VIOLATION IS UNACCEPTABLE:
1. Translate EVERY single sentence and paragraph - NEVER skip, summarize, condense, or omit ANY content
2. Output length MUST be similar to input length - if input is 1000 words, output should be ~1000 words
3. Keep ALL placeholders EXACTLY as written:
   - [CODE_N] - code blocks
   - [ICODE_N] - inline code
   - [LINK_N] - markdown links
   - [IMG_N] - images
   - [CITE_N] - numeric citations like [1], [2,3]
   - [ACITE_N] - academic citations like [Smith et al., 2020]
   DO NOT modify, move, delete, or translate any placeholder!
4. Keep ALL Markdown structure:
   - Same number of headings (# ## ###) with same levels
   - Same number of list items (- or *)
   - Same number of paragraphs
   - Same tables with same columns and rows
5. Do NOT add any introduction, conclusion, notes, or explanations
6. Do NOT merge or split paragraphs
7. Do NOT change the order of any content
8. Output ONLY the translated Markdown - nothing else

Remember: COMPLETE TRANSLATION, not summary. Every line must be translated.`

  const userPrompt = `Translate the following Markdown to ${langName}.

CRITICAL: This is a COMPLETE translation task, NOT a summary.
- Input has ${protectedText.split('\n').length} lines - output MUST have similar line count
- Every heading, paragraph, and list item MUST appear in the output
- All [CODE_N], [ICODE_N], [LINK_N], [IMG_N], [CITE_N], [ACITE_N] placeholders MUST remain EXACTLY as is

Text to translate:
${protectedText}`

  const { text: result } = await generateText({
    model,
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 0,
  })

  return restoreCode(result, blocks)
}

/**
 * Translate markdown content with chunking
 */
export async function translateMarkdown(
  markdown: string,
  options: TranslateOptions
): Promise<string> {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`TRANSLATION START`)
  console.log(`${'='.repeat(60)}`)
  console.log(`Provider: ${options.provider}`)
  console.log(`Model: ${options.model}`)
  console.log(`Target: ${options.targetLang}`)
  console.log(`Original: ${markdown.length} chars`)

  const langName = getLanguageName(options.targetLang)
  const model = getModel(options.provider, options.model)

  // Split into chunks - smaller chunks for better quality
  const chunks = splitIntoChunks(markdown, 6000)
  console.log(`\nSplit into ${chunks.length} chunks`)

  if (options.onProgress) {
    options.onProgress(0, chunks.length)
  }

  const translatedChunks: string[] = []

  for (let i = 0; i < chunks.length; i++) {
    console.log(`\n--- Chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars) ---`)

    const startTime = Date.now()
    const translated = await translateChunk(chunks[i], langName, model)
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

    console.log(`Translated in ${elapsed}s → ${translated.length} chars`)

    // Quick validation
    const origHeadings = (chunks[i].match(/^#+ /gm) || []).length
    const transHeadings = (translated.match(/^#+ /gm) || []).length
    if (origHeadings !== transHeadings) {
      console.warn(`Heading count changed: ${origHeadings} → ${transHeadings}`)
    }

    translatedChunks.push(translated)

    if (options.onProgress) {
      options.onProgress(i + 1, chunks.length)
    }
  }

  const result = translatedChunks.join('\n\n')

  console.log(`\n${'='.repeat(60)}`)
  console.log(`TRANSLATION COMPLETE: ${result.length} chars`)
  console.log(`${'='.repeat(60)}\n`)

  return result
}

function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    'zh-CN': 'Simplified Chinese',
    'zh-TW': 'Traditional Chinese',
    'ja': 'Japanese',
    'ko': 'Korean',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ar': 'Arabic',
  }
  return names[code] || code
}
