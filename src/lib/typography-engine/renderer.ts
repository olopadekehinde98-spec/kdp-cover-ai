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

function scaleFontSize(text: string, basePx: number): number {
  const len = text.length
  if (len <= 12) return basePx
  if (len <= 20) return Math.round(basePx * 0.88)
  if (len <= 30) return Math.round(basePx * 0.75)
  return Math.round(basePx * 0.62)
}

export function buildTypographyLayout(input: TypographyInput): TypographyLayout {
  const { title, subtitle, authorName, genre, dims } = input
  const typo = GENRE_TYPOGRAPHY[genre]
  const ppi = dims.ppi

  // Front cover region
  const frontStartPx = Math.round(dims.frontCoverStartX * ppi)
  const frontWidthPx  = Math.round(dims.trimWidth * ppi)
  const totalHeightPx = dims.totalHeightPx
  const bleedPx = Math.round(dims.bleed * ppi)
  const safePx  = Math.round(dims.safeZone * ppi)

  const pad = safePx + Math.round(0.2 * ppi)
  const textMaxWidth = frontWidthPx - pad * 2

  // ── TITLE ─────────────────────────────────────────────────────
  // Base = 1.3" at 300 dpi → ~390 px ≈ 130 pt — large and bold
  const titleBasePx = Math.round(ppi * 1.3)
  const titleFontPx = scaleFontSize(title, titleBasePx)

  const titleText = typo.titleCase === 'uppercase'
    ? title.toUpperCase()
    : title.replace(/\b\w/g, c => c.toUpperCase())

  const titlePlacement: TextPlacement = {
    text: titleText,
    x: frontStartPx + pad,
    y: bleedPx + safePx + Math.round(ppi * 0.5),
    width: textMaxWidth,
    fontSize: titleFontPx,
    fontFamily: typo.titleFont,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: typo.letterSpacing,
    lineHeight: 1.15,
    align: 'center',
  }

  // ── SUBTITLE ──────────────────────────────────────────────────
  // Sits just below the title — 32% of title size
  const subtitleFontPx = Math.round(titleFontPx * 0.32)
  const titleLineCount = Math.ceil(titleText.length / 18)
  const subtitleY = titlePlacement.y + titleFontPx * 1.2 * titleLineCount + Math.round(ppi * 0.15)

  const subtitlePlacement: TextPlacement | undefined = subtitle
    ? {
        text: subtitle,
        x: frontStartPx + pad,
        y: subtitleY,
        width: textMaxWidth,
        fontSize: subtitleFontPx,
        fontFamily: typo.authorFont,
        fontWeight: '400',
        color: '#E0E0E0',
        letterSpacing: 0.06,
        lineHeight: 1.4,
        align: 'center',
      }
    : undefined

  // ── AUTHOR NAME ───────────────────────────────────────────────
  // Bottom of front cover — 0.32" tall, bold, with spacing from edge
  const authorFontPx = Math.round(ppi * 0.32)
  const authorPlacement: TextPlacement = {
    text: authorName.toUpperCase(),
    x: frontStartPx + pad,
    y: totalHeightPx - bleedPx - safePx - authorFontPx - Math.round(ppi * 0.35),
    width: textMaxWidth,
    fontSize: authorFontPx,
    fontFamily: typo.authorFont,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.15,
    lineHeight: 1.2,
    align: 'center',
  }

  // ── SPINE ─────────────────────────────────────────────────────
  const spineWidthPx = Math.round(dims.spineWidth * ppi)
  const hasSpineText = dims.spineWidth >= 0.2

  const spineTitlePlacement: TextPlacement | undefined = hasSpineText
    ? {
        text: titleText,
        x: Math.round(dims.spineStartX * ppi) + Math.floor(spineWidthPx / 2),
        y: bleedPx + safePx + Math.round(ppi * 0.4),
        width: totalHeightPx - bleedPx * 2 - safePx * 2,
        fontSize: Math.min(Math.round(spineWidthPx * 0.52), Math.round(ppi * 0.18)),
        fontFamily: typo.titleFont,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.05,
        lineHeight: 1,
        align: 'left',
        rotation: -90,
      }
    : undefined

  const spineAuthorPlacement: TextPlacement | undefined = hasSpineText
    ? {
        text: authorName.toUpperCase(),
        x: Math.round(dims.spineStartX * ppi) + Math.floor(spineWidthPx / 2),
        y: totalHeightPx - bleedPx - safePx - Math.round(ppi * 0.35),
        width: Math.round(ppi * 1.5),
        fontSize: Math.min(Math.round(spineWidthPx * 0.38), Math.round(ppi * 0.13)),
        fontFamily: typo.authorFont,
        fontWeight: '400',
        color: '#FFFFFF',
        letterSpacing: 0.08,
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
