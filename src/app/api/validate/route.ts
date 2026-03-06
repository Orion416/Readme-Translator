import { NextRequest, NextResponse } from 'next/server'
import { validateStructure } from '@/lib/validation/checker'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { original, translated } = body

    if (!original || typeof original !== 'string') {
      return NextResponse.json(
        { error: 'Original content is required' },
        { status: 400 }
      )
    }

    if (!translated || typeof translated !== 'string') {
      return NextResponse.json(
        { error: 'Translated content is required' },
        { status: 400 }
      )
    }

    const result = await validateStructure(original, translated)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Validation failed' },
      { status: 500 }
    )
  }
}
