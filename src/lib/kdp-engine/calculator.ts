import type { KDPInput, KDPDimensions, TrimSize } from './types'

const TRIM_SIZES: Record<TrimSize, { width: number; height: number }> = {
  '5x8':       { width: 5,     height: 8 },
  '5.06x7.81': { width: 5.06,  height: 7.81 },
  '5.25x8':    { width: 5.25,  height: 8 },
  '5.5x8.5':   { width: 5.5,   height: 8.5 },
  '6x9':       { width: 6,     height: 9 },
  '6.14x9.21': { width: 6.14,  height: 9.21 },
  '6.69x9.61': { width: 6.69,  height: 9.61 },
  '7x10':      { width: 7,     height: 10 },
  '7.44x9.69': { width: 7.44,  height: 9.69 },
  '7.5x9.25':  { width: 7.5,   height: 9.25 },
  '8x10':      { width: 8,     height: 10 },
  '8.5x11':    { width: 8.5,   height: 11 },
}

// Exact Amazon KDP spine width formulas
function calcSpineWidth(pageCount: number, paperType: KDPInput['paperType']): number {
  switch (paperType) {
    case 'black_and_white': return pageCount * 0.0025
    case 'color':           return pageCount * 0.002347
    case 'premium_color':   return pageCount * 0.002400
  }
}

export function calculateKDPDimensions(input: KDPInput, spineWidthOverride?: number): KDPDimensions {
  const trim = TRIM_SIZES[input.trimSize]
  if (!trim) throw new Error(`Unsupported trim size: "${input.trimSize}". Valid sizes: ${Object.keys(TRIM_SIZES).join(', ')}`)
  const bleed = 0.125 // Amazon standard bleed: 0.125" on all sides
  const safeZone = 0.25 // Inner safe zone: 0.25" from trim edge
  const ppi = 300 // Amazon requires 300 DPI minimum

  const spineWidth = spineWidthOverride ?? calcSpineWidth(input.pageCount, input.paperType)

  // Full wrap: back + spine + front + bleed on all sides
  const totalWidth = trim.width * 2 + spineWidth + bleed * 2
  const totalHeight = trim.height + bleed * 2

  // Section start positions (in inches from left edge of full-wrap)
  const backCoverStartX = bleed
  const spineStartX = bleed + trim.width
  const frontCoverStartX = bleed + trim.width + spineWidth

  // Barcode: bottom-right of back cover, 2" x 1.2", 0.25" from safe zone
  const barcodeWidth = 2.0
  const barcodeHeight = 1.2
  const barcodeX = backCoverStartX + trim.width - barcodeWidth - safeZone
  const barcodeY = totalHeight - bleed - barcodeHeight - safeZone

  return {
    trimWidth: trim.width,
    trimHeight: trim.height,
    spineWidth: parseFloat(spineWidth.toFixed(4)),
    bleed,
    safeZone,
    totalWidth: parseFloat(totalWidth.toFixed(4)),
    totalHeight: parseFloat(totalHeight.toFixed(4)),
    barcodeWidth,
    barcodeHeight,
    barcodeX: parseFloat(barcodeX.toFixed(4)),
    barcodeY: parseFloat(barcodeY.toFixed(4)),
    frontCoverStartX: parseFloat(frontCoverStartX.toFixed(4)),
    spineStartX: parseFloat(spineStartX.toFixed(4)),
    backCoverStartX: parseFloat(backCoverStartX.toFixed(4)),
    ppi,
    totalWidthPx: Math.round(totalWidth * ppi),
    totalHeightPx: Math.round(totalHeight * ppi),
  }
}

export function getTrimSizeOptions(): Array<{ value: TrimSize; label: string }> {
  return Object.entries(TRIM_SIZES).map(([key, val]) => ({
    value: key as TrimSize,
    label: `${val.width}" × ${val.height}"`,
  }))
}
