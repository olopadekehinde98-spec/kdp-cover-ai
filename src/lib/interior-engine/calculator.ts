import type { InteriorDimensions } from './types'

/** Parse '6x9' → { w: 6, h: 9 } */
function parseTrimSize(trimSize: string): { w: number; h: number } {
  const parts = trimSize.split('x').map(Number)
  if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
    return { w: 6, h: 9 } // safe default
  }
  return { w: parts[0], h: parts[1] }
}

/**
 * Amazon KDP inside (gutter) margin rules by page count.
 * Source: KDP content guidelines.
 */
function getInsideMargin(pageCount: number): number {
  if (pageCount < 150)  return 0.375
  if (pageCount < 300)  return 0.5
  if (pageCount < 500)  return 0.625
  if (pageCount < 600)  return 0.75
  if (pageCount < 700)  return 0.875
  return 1.0
}

export function calculateInteriorDimensions(
  trimSize: string,
  pageCount: number,
): InteriorDimensions {
  const { w, h } = parseTrimSize(trimSize)
  const insideMargin  = getInsideMargin(pageCount)
  const outsideMargin = 0.25
  const topMargin     = 0.75   // leaves room for optional header
  const bottomMargin  = 0.75   // leaves room for page number

  return {
    trimWidth:     w,
    trimHeight:    h,
    insideMargin,
    outsideMargin,
    topMargin,
    bottomMargin,
    textWidth:  w - insideMargin - outsideMargin,
    textHeight: h - topMargin - bottomMargin,
    pt: 72,
  }
}

/** Supported trim sizes shown in the UI */
export const TRIM_SIZES = [
  { value: '5x8',     label: '5" × 8"' },
  { value: '5.5x8.5', label: '5.5" × 8.5"' },
  { value: '6x9',     label: '6" × 9" (most popular)' },
  { value: '7x10',    label: '7" × 10"' },
  { value: '8x10',    label: '8" × 10"' },
  { value: '8.5x11',  label: '8.5" × 11"' },
] as const
