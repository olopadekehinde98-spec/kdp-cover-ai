import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { generateCoverImage } from '@/lib/ai-engine/generator'

export const maxDuration = 60 // seconds — Pollinations can take 30-50s
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
    const dims = calculateKDPDimensions(kdpInput)

    const genInput: GenerationInput = {
      title: data.title,
      subtitle: data.subtitle,
      authorName: data.authorName,
      genre: data.genre,
      userPrompt: data.prompt,
    }

    // Generate AI image
    const imageResult = await generateCoverImage(genInput, 'full-wrap')

    // Auto-generate description if not provided
    const description = data.description || await generateBookDescription(data.title, data.genre, data.prompt)

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

    // Update cover record
    await prisma.cover.update({
      where: { id: cover.id },
      data: {
        imageUrl: imageResult.imageUrl,
        enhancedPrompt: imageResult.revisedPrompt,
        description,
        spineWidth: dims.spineWidth,
        totalWidthIn: dims.totalWidth,
        totalHeightIn: dims.totalHeight,
        status: 'COMPLETED',
        generationCostUsd: 0.08,
      },
    })

    // Increment usage
    await prisma.user.update({
      where: { id: user.id },
      data: { generationsUsed: { increment: 1 } },
    })

    return NextResponse.json({
      coverId: cover.id,
      imageUrl: imageResult.imageUrl,
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
    console.error('Generation error:', err)
    return NextResponse.json({ error: 'Generation failed. Please try again.' }, { status: 500 })
  }
}
