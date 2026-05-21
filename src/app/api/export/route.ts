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

    // ---- PNG / JPG export — front-cover portrait crop only (no text, no barcode) ----
    if (format === 'png' || format === 'jpg') {
      const sharp = (await import('sharp')).default

      // Fetch / decode the full-wrap AI image
      let imgBuffer: Buffer
      if (cover.imageUrl.startsWith('data:')) {
        const base64 = cover.imageUrl.split(',')[1]
        if (!base64) throw new Error('Invalid image data')
        imgBuffer = Buffer.from(base64, 'base64')
      } else {
        const res = await fetch(cover.imageUrl)
        if (!res.ok) throw new Error('Could not fetch cover image')
        imgBuffer = Buffer.from(await res.arrayBuffer())
      }

      // Introspect actual pixel dimensions of the stored image
      const meta = await sharp(imgBuffer).metadata()
      const imgW = meta.width ?? dims.totalWidthPx
      const imgH = meta.height ?? dims.totalHeightPx

      // Calculate front-cover crop rectangle proportionally
      // frontCoverStartX and trimWidth are in inches; scale to actual image pixels
      const scaleX = imgW / dims.totalWidth
      const cropLeft  = Math.round(dims.frontCoverStartX * scaleX)
      const cropWidth = Math.min(Math.round(dims.trimWidth * scaleX), imgW - cropLeft)

      // Resize the crop to the correct 300-DPI output size
      const outW = Math.round(dims.trimWidth  * dims.ppi)
      const outH = Math.round(dims.trimHeight * dims.ppi)

      let croppedBuffer: Buffer
      if (format === 'png') {
        croppedBuffer = await sharp(imgBuffer)
          .extract({ left: cropLeft, top: 0, width: cropWidth, height: imgH })
          .resize(outW, outH, { fit: 'fill' })
          .png({ compressionLevel: 8 })
          .toBuffer()
      } else {
        croppedBuffer = await sharp(imgBuffer)
          .extract({ left: cropLeft, top: 0, width: cropWidth, height: imgH })
          .resize(outW, outH, { fit: 'fill' })
          .jpeg({ quality: 95 })
          .toBuffer()
      }

      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
      return new NextResponse(new Uint8Array(croppedBuffer), {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Content-Disposition': `attachment; filename="${safeName}-front-cover.${format}"`,
          'Content-Length': croppedBuffer.length.toString(),
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
