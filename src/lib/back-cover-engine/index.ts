import type { KDPDimensions } from '@/lib/kdp-engine/types'
import type { Genre } from '@/lib/ai-engine/types'

export interface BackCoverInput {
  description: string
  authorBio?: string
  reviewQuote?: string
  reviewAttribution?: string
  genre: Genre
  dims: KDPDimensions
}

export interface BackCoverLayout {
  descriptionBox: { x: number; y: number; width: number; height: number }
  authorBioBox?: { x: number; y: number; width: number; height: number }
  quoteBox?: { x: number; y: number; width: number; height: number }
  barcodeBox: { x: number; y: number; width: number; height: number }
  textColor: string
  backgroundColor: string
}

export function buildBackCoverLayout(input: BackCoverInput): BackCoverLayout {
  const { dims } = input
  const ppi = dims.ppi
  const bleedPx = Math.round(dims.bleed * ppi)
  const safePx = Math.round(dims.safeZone * ppi)
  const padding = bleedPx + safePx + Math.round(0.15 * ppi)

  const backStartPx = Math.round(dims.backCoverStartX * ppi)
  const backWidthPx = Math.round(dims.trimWidth * ppi)
  const totalHeightPx = dims.totalHeightPx

  const barcodeWidthPx = Math.round(dims.barcodeWidth * ppi)
  const barcodeHeightPx = Math.round(dims.barcodeHeight * ppi)
  const barcodeXPx = Math.round(dims.barcodeX * ppi)
  const barcodeYPx = Math.round(dims.barcodeY * ppi)

  const contentWidth = backWidthPx - padding * 2
  const topY = bleedPx + safePx + Math.round(0.4 * ppi)

  // Reserve space: barcodeBox at bottom-right, description above it
  const descriptionHeight = barcodeYPx - topY - Math.round(0.3 * ppi)

  const descriptionBox = {
    x: backStartPx + padding,
    y: topY,
    width: contentWidth,
    height: Math.round(descriptionHeight * 0.65),
  }

  const quoteBox = input.reviewQuote
    ? {
        x: backStartPx + padding,
        y: topY + Math.round(descriptionHeight * 0.67),
        width: contentWidth,
        height: Math.round(descriptionHeight * 0.15),
      }
    : undefined

  const authorBioBox = input.authorBio
    ? {
        x: backStartPx + padding,
        y: topY + Math.round(descriptionHeight * 0.83),
        width: contentWidth - barcodeWidthPx - Math.round(0.2 * ppi),
        height: Math.round(descriptionHeight * 0.17),
      }
    : undefined

  const barcodeBox = {
    x: barcodeXPx,
    y: barcodeYPx,
    width: barcodeWidthPx,
    height: barcodeHeightPx,
  }

  return {
    descriptionBox,
    authorBioBox,
    quoteBox,
    barcodeBox,
    textColor: '#FFFFFF',
    backgroundColor: 'transparent',
  }
}

export async function generateBookDescription(
  title: string,
  genre: Genre,
  prompt: string
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return `An gripping ${genre} that will keep you turning pages. ${title} takes readers on an unforgettable journey.`
  }

  const { default: OpenAI } = await import('openai')
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const res = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a professional book cover copywriter. Write compelling back-cover descriptions that sell books. Maximum 120 words. No marketing fluff. Pure story hook.',
      },
      {
        role: 'user',
        content: `Write a back-cover description for a ${genre} book titled "${title}". Theme/concept: ${prompt}`,
      },
    ],
    max_tokens: 200,
    temperature: 0.8,
  })

  return res.choices[0].message.content?.trim() ?? ''
}
