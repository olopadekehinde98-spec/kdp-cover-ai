import type { Genre } from '@/lib/ai-engine/types'
import type { KDPDimensions } from '@/lib/kdp-engine/types'
import type { TypographyLayout, TextPlacement } from './types'
import { GENRE_TYPOGRAPHY } from './fonts'

interface TypographyInput {
  title: string
  subtitle?: string
  authorName: string
  genre: Genre
  dims: KDPDimensions
}

function calcFontSize(text: string, maxWidthPx: number, basePx: number): number {
  // Rough character-width scaling: reduce size for long titles
  const charCount = text.length
  if (charCount <= 15) return basePx
  if (charCount <= 25) return Math.round(basePx * 0.85)
  if (charCount <= 35) return Math.round(basePx * 0.72)
  return Math.round(basePx * 0.60)
}

export function buildTypographyLayout(input: TypographyInput): TypographyLayout {
  const { title, subtitle, authorName, genre, dims } = input
  const typo = GENRE_TYPOGRAPHY[genre]
  const ppi = dims.ppi

  // Front cover region in pixels
  const frontStartPx = Math.round(dims.frontCoverStartX * ppi)
  const frontWidthPx = Math.round(dims.trimWidth * ppi)
  const totalHeightPx = dims.totalHeightPx
  const bleedPx = Math.round(dims.bleed * ppi)
  const safePx = Math.round(dims.safeZone * ppi)

  const textPadding = safePx + Math.round(0.15 * ppi)
  const textMaxWidth = frontWidthPx - textPadding * 2

  // Title placement: upper portion of front cover
  const titleBaseFontPx = Math.round(ppi * 0.55) // ~165px at 300dpi
  const titleFontPx = calcFontSize(title, textMaxWidth, titleBaseFontPx)

  const titlePlacement: TextPlacement = {
    text: typo.titleCase === 'uppercase'
      ? title.toUpperCase()
      : typo.titleCase === 'capitalize'
        ? title.replace(/\b\w/g, c => c.toUpperCase())
        : title,
    x: frontStartPx + textPadding,
    y: bleedPx + safePx + Math.round(ppi * 0.3),
    width: textMaxWidth,
    fontSize: titleFontPx,
    fontFamily: typo.titleFont,
    fontWeight: typo.titleWeight,
    color: typo.titleColor,
    letterSpacing: typo.letterSpacing,
    lineHeight: 1.15,
    align: 'center',
  }

  // Subtitle below title
  const subtitlePlacement: TextPlacement | undefined = subtitle
    ? {
        text: subtitle,
        x: frontStartPx + textPadding,
        y: titlePlacement.y + titleFontPx * 1.4 * Math.ceil(title.length / 20),
        width: textMaxWidth,
        fontSize: Math.round(titleFontPx * 0.38),
        fontFamily: typo.authorFont,
        fontWeight: '400',
        color: typo.subtitleColor,
        letterSpacing: 0.04,
        lineHeight: 1.3,
        align: 'center',
      }
    : undefined

  // Author placement: bottom of front cover
  const authorFontPx = Math.round(ppi * 0.22)
  const authorPlacement: TextPlacement = {
    text: authorName,
    x: frontStartPx + textPadding,
    y: totalHeightPx - bleedPx - safePx - authorFontPx - Math.round(ppi * 0.2),
    width: textMaxWidth,
    fontSize: authorFontPx,
    fontFamily: typo.authorFont,
    fontWeight: '400',
    color: typo.authorColor,
    letterSpacing: 0.08,
    lineHeight: 1.2,
    align: 'center',
  }

  // Spine text — only if spine is wide enough (>= 0.2")
  const spineWidthPx = Math.round(dims.spineWidth * ppi)
  const hasSpineText = dims.spineWidth >= 0.2

  const spineTitlePlacement: TextPlacement | undefined = hasSpineText
    ? {
        text: typo.titleCase === 'uppercase' ? title.toUpperCase() : title,
        x: Math.round(dims.spineStartX * ppi) + Math.floor(spineWidthPx / 2),
        y: bleedPx + safePx + Math.round(ppi * 0.3),
        width: totalHeightPx - bleedPx * 2 - safePx * 2,
        fontSize: Math.min(Math.round(spineWidthPx * 0.55), Math.round(ppi * 0.18)),
        fontFamily: typo.titleFont,
        fontWeight: typo.titleWeight,
        color: typo.titleColor,
        letterSpacing: 0.05,
        lineHeight: 1,
        align: 'left',
        rotation: -90,
      }
    : undefined

  const spineAuthorPlacement: TextPlacement | undefined = hasSpineText
    ? {
        text: authorName,
        x: Math.round(dims.spineStartX * ppi) + Math.floor(spineWidthPx / 2),
        y: totalHeightPx - bleedPx - safePx - Math.round(ppi * 0.3),
        width: Math.round(ppi * 1.5),
        fontSize: Math.min(Math.round(spineWidthPx * 0.4), Math.round(ppi * 0.13)),
        fontFamily: typo.authorFont,
        fontWeight: '400',
        color: typo.authorColor,
        letterSpacing: 0.04,
        lineHeight: 1,
        align: 'right',
        rotation: -90,
      }
    : undefined

  return {
    title: titlePlacement,
    subtitle: subtitlePlacement,
    author: authorPlacement,
    spineTitle: spineTitlePlacement,
    spineAuthor: spineAuthorPlacement,
  }
}
