import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import remarkGfm from 'remark-gfm'
import { visit } from 'unist-util-visit'
import type { Root, Code, InlineCode, Link, Image, Html, Table } from 'mdast'
import type { ProtectionMap, ProtectionResult } from '@/types'

// Placeholder prefixes for different content types
const PLACEHOLDERS = {
  codeBlock: '<<CODE_BLOCK_',
  inlineCode: '<<INLINE_CODE_',
  html: '<<HTML_BLOCK_',
  badge: '<<BADGE_',
  url: '<<URL_',
  suffix: '>>',
}

// Badge URL patterns
const BADGE_PATTERNS = [
  /shields\.io/,
  /badge\.fury\.io/,
  /badgen\.net/,
  /badges\.githubusercontent\.com/,
  /coveralls\.io/,
  /codecov\.io/,
  /travis-ci\.org/,
  /travis-ci\.com/,
  /circleci\.com/,
  /img\.shields\.io/,
]

/**
 * Check if an image URL is a badge
 */
function isBadgeUrl(url: string): boolean {
  return BADGE_PATTERNS.some(pattern => pattern.test(url))
}

/**
 * Create protection plugin for remark
 */
function createProtectionPlugin(protectionMap: ProtectionMap, counter: { value: number }) {
  return (tree: Root) => {
    visit(tree, (node, index, parent) => {
      // Protect fenced code blocks
      if (node.type === 'code') {
        const codeNode = node as Code
        const placeholder = `${PLACEHOLDERS.codeBlock}${counter.value}${PLACEHOLDERS.suffix}`
        const originalContent = codeNode.value || ''

        // Include language and meta info
        let fullContent = ''
        if (codeNode.lang) {
          fullContent += `\`\`\`${codeNode.lang}`
          if (codeNode.meta) {
            fullContent += ` ${codeNode.meta}`
          }
          fullContent += '\n'
        } else {
          fullContent += '```\n'
        }
        fullContent += originalContent
        fullContent += '\n```'

        protectionMap.set(placeholder, fullContent)

        // Replace with placeholder text node
        if (parent && typeof index === 'number') {
          parent.children[index] = {
            type: 'text',
            value: placeholder,
          } as any
        }
        counter.value++
      }

      // Protect inline code
      if (node.type === 'inlineCode') {
        const inlineNode = node as InlineCode
        const placeholder = `${PLACEHOLDERS.inlineCode}${counter.value}${PLACEHOLDERS.suffix}`
        protectionMap.set(placeholder, `\`${inlineNode.value}\``)

        if (parent && typeof index === 'number') {
          parent.children[index] = {
            type: 'text',
            value: placeholder,
          } as any
        }
        counter.value++
      }

      // Protect badge images (entire image syntax)
      if (node.type === 'image') {
        const imageNode = node as Image
        if (isBadgeUrl(imageNode.url)) {
          const placeholder = `${PLACEHOLDERS.badge}${counter.value}${PLACEHOLDERS.suffix}`
          const alt = imageNode.alt || ''
          const title = imageNode.title ? ` "${imageNode.title}"` : ''
          protectionMap.set(placeholder, `![${alt}](${imageNode.url}${title})`)

          if (parent && typeof index === 'number') {
            parent.children[index] = {
              type: 'text',
              value: placeholder,
            } as any
          }
          counter.value++
        }
      }

      // Protect HTML blocks (comments, raw HTML)
      if (node.type === 'html') {
        const htmlNode = node as Html
        const placeholder = `${PLACEHOLDERS.html}${counter.value}${PLACEHOLDERS.suffix}`
        protectionMap.set(placeholder, htmlNode.value)

        if (parent && typeof index === 'number') {
          parent.children[index] = {
            type: 'text',
            value: placeholder,
          } as any
        }
        counter.value++
      }
    })
  }
}

/**
 * Protect non-translatable content in markdown
 */
export async function protectMarkdown(markdown: string): Promise<ProtectionResult> {
  const protectionMap: ProtectionMap = new Map()
  const counter = { value: 0 }

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(createProtectionPlugin, protectionMap, counter)
    .use(remarkStringify, {
      bullet: '-',
      emphasis: '*',
      rule: '-',
      listItemIndent: 'one',
      fences: true,
      fence: '`',
    })
    .process(markdown)

  const protectedText = String(file)

  return {
    protectedText,
    protectionMap,
  }
}

/**
 * Get protection statistics
 */
export function getProtectionStats(protectionMap: ProtectionMap): {
  codeBlocks: number
  inlineCode: number
  badges: number
  html: number
} {
  let codeBlocks = 0
  let inlineCode = 0
  let badges = 0
  let html = 0

  for (const [placeholder] of protectionMap) {
    if (placeholder.startsWith(PLACEHOLDERS.codeBlock)) codeBlocks++
    else if (placeholder.startsWith(PLACEHOLDERS.inlineCode)) inlineCode++
    else if (placeholder.startsWith(PLACEHOLDERS.badge)) badges++
    else if (placeholder.startsWith(PLACEHOLDERS.html)) html++
  }

  return { codeBlocks, inlineCode, badges, html }
}
