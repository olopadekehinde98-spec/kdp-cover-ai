import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { calculateKDPDimensions, validateKDPInput, getTrimSizeOptions } from '@/lib/kdp-engine'
import type { KDPInput } from '@/lib/kdp-engine'
import { z } from 'zod'

const schema = z.object({
  trimSize: z.string(),
  pageCount: z.number().int().min(24).max(828),
  paperType: z.enum(['black_and_white', 'color', 'premium_color']),
  coverType: z.enum(['paperback', 'hardcover']),
})

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const input = parsed.data as KDPInput
  const validation = validateKDPInput(input)

  if (!validation.valid) {
    return NextResponse.json({ error: 'KDP validation failed', details: validation.errors }, { status: 422 })
  }

  const dims = calculateKDPDimensions(input)

  return NextResponse.json({
    dimensions: dims,
    validation,
    summary: {
      totalWidth: `${dims.totalWidth.toFixed(3)}"`,
      totalHeight: `${dims.totalHeight.toFixed(3)}"`,
      spineWidth: `${dims.spineWidth.toFixed(4)}"`,
      totalPixels: `${dims.totalWidthPx} × ${dims.totalHeightPx} px`,
      bleed: `${dims.bleed}"`,
    },
  })
}

export async function GET() {
  return NextResponse.json({ trimSizes: getTrimSizeOptions() })
}
