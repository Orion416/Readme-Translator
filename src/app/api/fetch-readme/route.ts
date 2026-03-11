import { NextRequest, NextResponse } from 'next/server'
import { fetchContent, isValidGitHubUrl } from '@/lib/github/fetcher'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, mode } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL or content is required' },
        { status: 400 }
      )
    }

    const isUrl = mode === 'url'

    // Validate URL if in URL mode
    if (isUrl && !isValidGitHubUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid GitHub/Gitee URL. Please use a format like: https://github.com/owner/repo or https://gitee.com/owner/repo' },
        { status: 400 }
      )
    }

    const result = await fetchContent(url, isUrl)

    return NextResponse.json({
      success: true,
      content: result.content,
      filename: result.filename,
      source: result.source,
    })
  } catch (error) {
    console.error('Fetch README error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch content' },
      { status: 500 }
    )
  }
}
