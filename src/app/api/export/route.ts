import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { generateKDPPdf, validateExport } from '@/lib/export-engine/pdf-generator'

export const maxDuration = 60
import { calculateKDPDimensions } from '@/lib/kdp-engine/calculator'
import { buildTypographyLayout } from '@/lib/typography-engine/renderer'
import { buildBackCoverLayout } from '@/lib/back-cover-engine'
import type { KDPInput } from '@/lib/kdp-engine/types'

const schema = z.object({
  coverId: z.string(),
  format: z.enum(['pdf', 'png', 'jpg']).optional().default('pdf'),
  titleFontScale: z.number().min(0.5).max(1.6).optional(),
  titleStyle: z.enum(['bold-sans', 'serif', 'serif-italic', 'sans-oblique', 'courier-bold', 'serif-light']).optional(),
  isbn: z.string().max(30).optional(),
  barcodeImageBase64: z.string().optional(),
  spineWidthOverride: z.number().min(0.06).max(3).optional(),
  reviewQuote: z.string().max(300).optional(),
  reviewAttribution: z.string().max(100).optional(),
})

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const cover = await prisma.cover.findFirst({
    where: { id: parsed.data.coverId, userId: user.id },
  })

  if (!cover) return NextResponse.json({ error: 'Cover not found' }, { status: 404 })
  if (!cover.imageUrl) return NextResponse.json({ error: 'Cover image not ready' }, { status: 422 })

  const format = parsed.data.format ?? 'pdf'

  try {
    const kdpInput: KDPInput = {
      trimSize: cover.trimSize as KDPInput['trimSize'],
      pageCount: cover.pageCount,
      paperType: cover.paperType as KDPInput['paperType'],
      coverType: cover.coverType as KDPInput['coverType'],
    }
    const dims = calculateKDPDimensions(kdpInput, parsed.data.spineWidthOverride)

    const typography = buildTypographyLayout({
      title: cover.title,
      subtitle: cover.subtitle ?? undefined,
      authorName: cover.authorName,
      genre: cover.genre as any,
      dims,
    })

    const backCover = buildBackCoverLayout({
      description: cover.description ?? '',
      authorBio: cover.authorBio ?? undefined,
      genre: cover.genre as any,
      dims,
    })

    const exportInput = {
      imageUrl: cover.imageUrl,
      dims,
      typography,
      backCover,
      title: cover.title,
      subtitle: cover.subtitle ?? undefined,
      authorName: cover.authorName,
      description: cover.description ?? '',
      authorBio: cover.authorBio ?? undefined,
      reviewQuote: parsed.data.reviewQuote ?? cover.reviewQuote ?? undefined,
      reviewAttribution: parsed.data.reviewAttribution,
      titleFontScale: parsed.data.titleFontScale,
      titleStyle: parsed.data.titleStyle,
      isbn: parsed.data.isbn,
      barcodeImageBase64: parsed.data.barcodeImageBase64,
      isFreePlan: user.plan === 'FREE',
      isAgencyPlan: user.plan === 'AGENCY',
    }

    const validation = validateExport(exportInput)
    if (!validation.valid) {
      return NextResponse.json({ error: 'Export validation failed', details: validation.errors }, { status: 422 })
    }

    const result = await generateKDPPdf(exportInput)
    const safeName = encodeURIComponent(cover.title.replace(/[^a-z0-9]/gi, '-').toLowerCase())

    // ---- PNG / JPG export — return the full-wrap AI-generated cover image ----
    if (format === 'png' || format === 'jpg') {
      // The full-wrap AI image is stored in cover.imageUrl (base64 or URL)
      let imgBuffer: Buffer

      if (cover.imageUrl.startsWith('data:')) {
        // base64 stored in DB — decode it
        const base64 = cover.imageUrl.split(',')[1]
        if (!base64) throw new Error('Invalid image data')
        imgBuffer = Buffer.from(base64, 'base64')
      } else {
        // URL — fetch it
        const res = await fetch(cover.imageUrl)
        if (!res.ok) throw new Error('Could not fetch cover image')
        const arr = await res.arrayBuffer()
        imgBuffer = Buffer.from(arr)
      }

      // Determine the actual mime type from the stored image
      const storedMime = cover.imageUrl.startsWith('data:')
        ? (cover.imageUrl.split(';')[0].split(':')[1] ?? 'image/jpeg')
        : 'image/jpeg'

      const mimeType = storedMime.includes('png') ? 'image/png' : 'image/jpeg'
      const ext = mimeType === 'image/png' ? 'png' : 'jpg'

      return new NextResponse(new Uint8Array(imgBuffer), {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Content-Disposition': `attachment; filename="${safeName}-kdp-cover-fullwrap.${ext}"`,
          'Content-Length': imgBuffer.length.toString(),
        },
      })
    }

    // ---- PDF export (default) ----
    await prisma.export.create({
      data: {
        coverId: cover.id,
        userId: user.id,
        format: 'pdf',
        url: `exports/${cover.id}.pdf`,
        fileSizeBytes: result.fileSizeBytes,
      },
    })

    return new NextResponse(new Uint8Array(result.pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeName}-kdp-cover.pdf"`,
        'Content-Length': result.fileSizeBytes.toString(),
        'X-KDP-Width': `${result.widthPx}px`,
        'X-KDP-Height': `${result.heightPx}px`,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Export error:', msg)
    return NextResponse.json({ error: `Export failed: ${msg}` }, { status: 500 })
  }
}
