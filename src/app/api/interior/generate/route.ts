import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { generateInteriorPdf } from '@/lib/interior-engine/generator'
import type { InteriorTemplate, LineSpacing } from '@/lib/interior-engine/types'

export const maxDuration = 60

const schema = z.object({
  title:          z.string().max(200).optional(),
  template:       z.enum(['lined','dotted','blank','graph','planner-weekly','planner-daily','habit-tracker','recipe']),
  trimSize:       z.enum(['5x8','5.5x8.5','6x9','7x10','8x10','8.5x11']),
  pageCount:      z.number().int().min(24).max(800),
  paperType:      z.enum(['black_and_white','color']),
  lineSpacing:    z.enum(['narrow','medium','wide']).optional(),
  hasHeader:      z.boolean().optional(),
  hasPageNumbers: z.boolean().optional(),
  headerText:     z.string().max(100).optional(),
  primaryColor:   z.string().max(9).optional(),   // '#7c3aed'
  customData:     z.string().max(2000).optional(), // JSON
})

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (user.isBanned) return NextResponse.json({ error: 'Account suspended' }, { status: 403 })

  const body   = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data
  const isFreePlan = user.plan === 'FREE'

  // Create interior record
  const interior = await prisma.interior.create({
    data: {
      userId:         user.id,
      title:          data.title,
      template:       data.template,
      trimSize:       data.trimSize,
      pageCount:      data.pageCount,
      paperType:      data.paperType,
      lineSpacing:    data.lineSpacing,
      hasHeader:      data.hasHeader  ?? false,
      hasPageNumbers: data.hasPageNumbers ?? true,
      headerText:     data.headerText,
      primaryColor:   data.primaryColor,
      customData:     data.customData,
      status:         'GENERATING',
    },
  })

  try {
    const result = await generateInteriorPdf(
      {
        title:          data.title,
        template:       data.template as InteriorTemplate,
        trimSize:       data.trimSize,
        pageCount:      data.pageCount,
        paperType:      data.paperType,
        lineSpacing:    data.lineSpacing as LineSpacing | undefined,
        hasHeader:      data.hasHeader,
        hasPageNumbers: data.hasPageNumbers,
        headerText:     data.headerText,
        primaryColor:   data.primaryColor,
        customData:     data.customData,
      },
      isFreePlan,
    )

    await prisma.interior.update({
      where: { id: interior.id },
      data:  { status: 'COMPLETED' },
    })

    // Stream back the PDF directly — avoids storing large base64 in DB
    return new NextResponse(new Uint8Array(result.pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="interior-${data.trimSize}-${data.pageCount}pg.pdf"`,
        'Content-Length':      result.fileSizeBytes.toString(),
        'X-Interior-Id':       interior.id,
        'X-Page-Count':        String(result.pageCount),
        'X-File-Size':         String(result.fileSizeBytes),
      },
    })
  } catch (err) {
    await prisma.interior.update({ where: { id: interior.id }, data: { status: 'FAILED' } })
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Interior generation error:', msg)
    return NextResponse.json({ error: `Generation failed: ${msg}` }, { status: 500 })
  }
}
