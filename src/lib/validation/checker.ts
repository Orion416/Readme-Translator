import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import { visit } from 'unist-util-visit'
import type { Root, Heading, Code, Link, Image, Table, TableRow, TableCell } from 'mdast'
import type { StructureMetrics, ValidationResult } from '@/types'

/**
 * Extract structure metrics from markdown content
 */
export async function extractStructureMetrics(markdown: string): Promise<StructureMetrics> {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown)

  const metrics: StructureMetrics = {
    headingCount: 0,
    headingLevels: [],
    codeBlockCount: 0,
    linkCount: 0,
    imageCount: 0,
    tableCount: 0,
    tableColumns: [],
  }

  visit(tree, (node) => {
    switch (node.type) {
      case 'heading': {
        const heading = node as Heading
        metrics.headingCount++
        metrics.headingLevels.push(heading.depth)
        break
      }

      case 'code': {
        const code = node as Code
        // Skip placeholder code blocks (from protection)
        if (!code.value?.startsWith('<<')) {
          metrics.codeBlockCount++
        }
        break
      }

      case 'link': {
        metrics.linkCount++
        break
      }

      case 'image': {
        const image = node as Image
        // Skip badge images (from protection)
        if (!image.url?.includes('shields.io') && !image.url?.includes('badge')) {
          metrics.imageCount++
        }
        break
      }

      case 'table': {
        const table = node as Table
        metrics.tableCount++
        // Count columns from first row
        if (table.children.length > 0) {
          const firstRow = table.children[0] as TableRow
          const colCount = firstRow.children.filter(
            (cell) => (cell as TableCell).children !== undefined
          ).length
          metrics.tableColumns.push(colCount)
        }
        break
      }
    }
  })

  return metrics
}

/**
 * Compare two structure metrics and find differences
 */
export function compareMetrics(
  original: StructureMetrics,
  translated: StructureMetrics
): string[] {
  const differences: string[] = []

  // Check heading count
  if (original.headingCount !== translated.headingCount) {
    differences.push(
      `Heading count mismatch: ${original.headingCount} → ${translated.headingCount}`
    )
  }

  // Check heading levels
  if (original.headingLevels.length === translated.headingLevels.length) {
    for (let i = 0; i < original.headingLevels.length; i++) {
      if (original.headingLevels[i] !== translated.headingLevels[i]) {
        differences.push(
          `Heading level changed at position ${i + 1}: H${original.headingLevels[i]} → H${translated.headingLevels[i]}`
        )
      }
    }
  }

  // Check code block count
  if (original.codeBlockCount !== translated.codeBlockCount) {
    differences.push(
      `Code block count mismatch: ${original.codeBlockCount} → ${translated.codeBlockCount}`
    )
  }

  // Check link count (allow some tolerance for translated link text)
  const linkDiff = Math.abs(original.linkCount - translated.linkCount)
  if (linkDiff > 0) {
    differences.push(
      `Link count difference: ${original.linkCount} → ${translated.linkCount}`
    )
  }

  // Check image count
  if (original.imageCount !== translated.imageCount) {
    differences.push(
      `Image count mismatch: ${original.imageCount} → ${translated.imageCount}`
    )
  }

  // Check table count
  if (original.tableCount !== translated.tableCount) {
    differences.push(
      `Table count mismatch: ${original.tableCount} → ${translated.tableCount}`
    )
  }

  // Check table columns
  if (original.tableColumns.length === translated.tableColumns.length) {
    for (let i = 0; i < original.tableColumns.length; i++) {
      if (original.tableColumns[i] !== translated.tableColumns[i]) {
        differences.push(
          `Table ${i + 1} column count changed: ${original.tableColumns[i]} → ${translated.tableColumns[i]}`
        )
      }
    }
  }

  return differences
}

/**
 * Validate structure consistency between original and translated markdown
 */
export async function validateStructure(
  original: string,
  translated: string
): Promise<ValidationResult> {
  const [originalMetrics, translatedMetrics] = await Promise.all([
    extractStructureMetrics(original),
    extractStructureMetrics(translated),
  ])

  const differences = compareMetrics(originalMetrics, translatedMetrics)

  return {
    isValid: differences.length === 0,
    original: originalMetrics,
    translated: translatedMetrics,
    differences,
  }
}

/**
 * Get a summary string of validation result
 */
export function getValidationSummary(result: ValidationResult): string {
  if (result.isValid) {
    return 'Structure validation passed'
  }

  return `Found ${result.differences.length} structural difference(s)`
}
