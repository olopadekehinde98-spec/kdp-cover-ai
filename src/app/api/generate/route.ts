import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { generateCoverImage } from '@/lib/ai-engine/generator'

export const maxDuration = 60
import { calculateKDPDimensions } from '@/lib/kdp-engine/calculator'
import { buildTypographyLayout } from '@/lib/typography-engine/renderer'
import { buildBackCoverLayout, generateBookDescription } from '@/lib/back-cover-engine'
import type { KDPInput } from '@/lib/kdp-engine/types'
import type { GenerationInput } from '@/lib/ai-engine/types'

const schema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().max(200).optional(),
  authorName: z.string().min(1).max(200),
  genre: z.enum(['thriller','romance','fantasy','sci-fi','mystery','horror','business','self-help','memoir','christian','children','literary-fiction','young-adult','historical-fiction','biography']),
  prompt: z.string().min(5).max(1000),
  description: z.string().max(2000).optional(),
  authorBio: z.string().max(500).optional(),
  trimSize: z.string(),
  pageCount: z.number().int().min(24).max(828),
  paperType: z.enum(['black_and_white', 'color', 'premium_color']),
  coverType: z.enum(['paperback', 'hardcover']),
  spineWidthOverride: z.number().min(0.06).max(3).optional(),
})

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch user and check limits
  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (user.isBanned) return NextResponse.json({ error: 'Account suspended' }, { status: 403 })

  if (user.generationsUsed >= user.generationsLimit) {
    return NextResponse.json({
      error: 'Generation limit reached',
      limit: user.generationsLimit,
      used: user.generationsUsed,
      upgradeUrl: '/pricing',
    }, { status: 429 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data

  // Create cover record
  const cover = await prisma.cover.create({
    data: {
      userId: user.id,
      title: data.title,
      subtitle: data.subtitle,
      authorName: data.authorName,
      genre: data.genre,
      prompt: data.prompt,
      description: data.description,
      authorBio: data.authorBio,
      trimSize: data.trimSize,
      pageCount: data.pageCount,
      paperType: data.paperType,
      coverType: data.coverType,
      status: 'GENERATING',
    },
  })

  try {
    const kdpInput: KDPInput = {
      trimSize: data.trimSize as KDPInput['trimSize'],
      pageCount: data.pageCount,
      paperType: data.paperType,
      coverType: data.coverType,
    }
    const dims = calculateKDPDimensions(kdpInput, data.spineWidthOverride)

    const genInput: GenerationInput = {
      title: data.title,
      subtitle: data.subtitle,
      authorName: data.authorName,
      genre: data.genre,
      userPrompt: data.prompt,
    }

    // Generate AI image
    const imageResult = await generateCoverImage(genInput, 'full-wrap')

    // Auto-generate description if not provided (wrapped so it never crashes the whole generation)
    let description = data.description || ''
    if (!description) {
      try {
        description = await generateBookDescription(data.title, data.genre, data.prompt)
      } catch (e) {
        console.warn('Book description generation failed, using fallback:', e)
        description = `A compelling ${data.genre} book that will keep you turning pages.`
      }
    }

    // Build layouts
    const typography = buildTypographyLayout({
      title: data.title,
      subtitle: data.subtitle,
      authorName: data.authorName,
      genre: data.genre,
      dims,
    })

    const backCover = buildBackCoverLayout({
      description,
      authorBio: data.authorBio,
      genre: data.genre,
      dims,
    })

    // Download image and store as base64 so it never expires
    let storedImageUrl = imageResult.imageUrl
    try {
      // Step 1: get raw bytes
      let imgBytes: Buffer
      if (imageResult.imageUrl.startsWith('data:')) {
        imgBytes = Buffer.from(imageResult.imageUrl.split(',')[1], 'base64')
      } else {
        const imgRes = await fetch(imageResult.imageUrl, { redirect: 'follow' })
        if (!imgRes.ok) throw new Error(`Image fetch failed: ${imgRes.status}`)
        imgBytes = Buffer.from(await imgRes.arrayBuffer())
      }

      // Step 2: try sharp to ensure clean JPEG — if sharp fails, use raw bytes as-is
      // (Pollinations already returns valid JPEG so raw bytes are safe)
      let finalBytes = imgBytes
      try {
        const sharp = (await import('sharp')).default
        finalBytes = await sharp(imgBytes).jpeg({ quality: 92 }).toBuffer()
      } catch {
        // sharp unavailable on this platform — raw bytes are already JPEG from Pollinations
        finalBytes = imgBytes
      }

      storedImageUrl = `data:image/jpeg;base64,${finalBytes.toString('base64')}`
    } catch (e) {
      console.warn('Image store warning:', e)
    }

    // Update cover record
    await prisma.cover.update({
      where: { id: cover.id },
      data: {
        imageUrl: storedImageUrl,
        enhancedPrompt: imageResult.revisedPrompt,
        description,
        spineWidth: dims.spineWidth,
        totalWidthIn: dims.totalWidth,
        totalHeightIn: dims.totalHeight,
        status: 'COMPLETED',
        generationCostUsd: 0.00,
      },
    })

    // Increment usage
    await prisma.user.update({
      where: { id: user.id },
      data: { generationsUsed: { increment: 1 } },
    })

    return NextResponse.json({
      coverId: cover.id,
      imageUrl: storedImageUrl,
      dims,
      typography,
      backCover,
      description,
    })
  } catch (err) {
    await prisma.cover.update({
      where: { id: cover.id },
      data: { status: 'FAILED' },
    })
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Generation error:', msg)
    return NextResponse.json({ error: `Generation failed: ${msg}` }, { status: 500 })
  }
}
