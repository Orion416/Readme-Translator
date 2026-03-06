import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import remarkGfm from 'remark-gfm'
import { visit } from 'unist-util-visit'
import type { Root, Heading, Content } from 'mdast'
import type { MarkdownChunk } from '@/types'

// Maximum chunk size in characters (larger = fewer chunks = better context retention)
const MAX_CHUNK_SIZE = 20000

/**
 * Split markdown into chunks based on headings
 */
export async function splitMarkdown(markdown: string): Promise<MarkdownChunk[]> {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown)

  const chunks: MarkdownChunk[] = []
  let currentChunk: Content[] = []
  let currentHeading: string | undefined
  let currentLevel: number | undefined
  let chunkId = 0

  // Track position for size-based splitting
  let currentSize = 0

  const flushChunk = async () => {
    if (currentChunk.length === 0) return

    const chunkTree: Root = {
      type: 'root',
      children: currentChunk,
    }

    const content = String(
      await unified()
        .use(remarkStringify, {
          bullet: '-',
          emphasis: '*',
          rule: '-',
          listItemIndent: 'one',
          fences: true,
          fence: '`',
        })
        .stringify(chunkTree)
    )

    chunks.push({
      id: chunkId++,
      content: content.trim(),
      heading: currentHeading,
      level: currentLevel,
    })

    currentChunk = []
    currentHeading = undefined
    currentLevel = undefined
    currentSize = 0
  }

  // Process nodes
  for (const node of tree.children) {
    // Check if this is a heading (split point)
    if (node.type === 'heading') {
      const headingNode = node as Heading
      const headingText = extractHeadingText(headingNode)

      // For level 1-2 headings, start a new chunk
      if (headingNode.depth <= 2 && currentChunk.length > 0) {
        await flushChunk()
      }

      currentHeading = headingText
      currentLevel = headingNode.depth
    }

    // Estimate size
    const nodeSize = estimateNodeSize(node)

    // Check if adding this node would exceed max size
    if (currentSize + nodeSize > MAX_CHUNK_SIZE && currentChunk.length > 0) {
      await flushChunk()
      // Reset heading info for continuation
      if (node.type === 'heading') {
        const headingNode = node as Heading
        currentHeading = extractHeadingText(headingNode)
        currentLevel = headingNode.depth
      }
    }

    currentChunk.push(node)
    currentSize += nodeSize
  }

  // Flush remaining content
  await flushChunk()

  return chunks
}

/**
 * Extract text content from a heading node
 */
function extractHeadingText(heading: Heading): string {
  let text = ''
  visit({ type: 'root', children: heading.children } as Root, 'text', (node) => {
    text += node.value
  })
  return text
}

/**
 * Estimate the character size of a node
 */
function estimateNodeSize(node: Content): number {
  switch (node.type) {
    case 'paragraph':
    case 'heading':
    case 'code':
    case 'html':
      return JSON.stringify(node).length
    case 'list':
      return JSON.stringify(node).length
    case 'table':
      return JSON.stringify(node).length
    default:
      return 100 // Default estimate
  }
}

/**
 * Merge chunks back into a single markdown string
 */
export function mergeChunks(chunks: MarkdownChunk[]): string {
  return chunks
    .map(chunk => chunk.content)
    .join('\n\n')
    .trim()
}

/**
 * Get statistics about the chunks
 */
export function getChunkStats(chunks: MarkdownChunk[]): {
  totalChunks: number
  totalSize: number
  averageSize: number
  largestChunk: number
} {
  const totalChunks = chunks.length
  const sizes = chunks.map(c => c.content.length)
  const totalSize = sizes.reduce((a, b) => a + b, 0)
  const largestChunk = Math.max(...sizes)

  return {
    totalChunks,
    totalSize,
    averageSize: Math.round(totalSize / totalChunks),
    largestChunk,
  }
}
