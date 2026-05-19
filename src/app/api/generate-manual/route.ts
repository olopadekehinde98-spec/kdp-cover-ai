import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { calculateKDPDimensions } from '@/lib/kdp-engine/calculator'
import { buildTypographyLayout } from '@/lib/typography-engine/renderer'
import { buildBackCoverLayout, generateBookDescription } from '@/lib/back-cover-engine'
import type { KDPInput } from '@/lib/kdp-engine/types'

export const maxDuration = 60

// Allow larger body for base64 image uploads (~8MB limit)
export const config = { api: { bodyParser: { sizeLimit: '10mb' } } }

const schema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().max(200).optional(),
  authorName: z.string().min(1).max(200),
  genre: z.enum(['thriller','romance','fantasy','sci-fi','mystery','horror','business','self-help','memoir','christian','children','literary-fiction','young-adult','historical-fiction','biography']),
  description: z.string().max(2000).optional(),
  authorBio: z.string().max(500).optional(),
  trimSize: z.string(),
  pageCount: z.number().int().min(24).max(828),
  paperType: z.enum(['black_and_white', 'color', 'premium_color']),
  coverType: z.enum(['paperback', 'hardcover']),
  imageBase64: z.string().min(10), // data:image/jpeg;base64,... or data:image/png;base64,...
})

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (user.isBanned) return NextResponse.json({ error: 'Account suspended' }, { status: 403 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data

  // Validate the uploaded image is JPEG or PNG
  const mime = data.imageBase64.split(';')[0].split(':')[1] ?? ''
  if (!['image/jpeg', 'image/png'].includes(mime)) {
    return NextResponse.json({ error: 'Only JPEG and PNG images are supported.' }, { status: 422 })
  }

  const kdpInput: KDPInput = {
    trimSize: data.trimSize as KDPInput['trimSize'],
    pageCount: data.pageCount,
    paperType: data.paperType,
    coverType: data.coverType,
  }
  const dims = calculateKDPDimensions(kdpInput)

  // Auto-generate description if not provided
  let description = data.description || ''
  if (!description) {
    try {
      description = await generateBookDescription(data.title, data.genre, data.title)
    } catch {
      description = `A compelling ${data.genre} book — ${data.title}.`
    }
  }

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

  const cover = await prisma.cover.create({
    data: {
      userId: user.id,
      title: data.title,
      subtitle: data.subtitle,
      authorName: data.authorName,
      genre: data.genre,
      prompt: 'uploaded-image',
      description,
      authorBio: data.authorBio,
      trimSize: data.trimSize,
      pageCount: data.pageCount,
      paperType: data.paperType,
      coverType: data.coverType,
      imageUrl: data.imageBase64,
      spineWidth: dims.spineWidth,
      totalWidthIn: dims.totalWidth,
      totalHeightIn: dims.totalHeight,
      status: 'COMPLETED',
      generationCostUsd: 0.00,
    },
  })

  return NextResponse.json({
    coverId: cover.id,
    imageUrl: data.imageBase64,
    dims,
    typography,
    backCover,
    description,
  })
}
