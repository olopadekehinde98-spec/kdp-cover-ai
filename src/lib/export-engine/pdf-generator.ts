import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib'
import type { ExportInput, ExportResult, ExportValidation } from './types'

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16) / 255
  const g = parseInt(clean.substring(2, 4), 16) / 255
  const b = parseInt(clean.substring(4, 6), 16) / 255
  return [r, g, b]
}

export function validateExport(input: ExportInput): ExportValidation {
  const errors: string[] = []
  const { dims } = input

  const widthIn = dims.totalWidth
  const heightIn = dims.totalHeight
  const dpi = dims.ppi

  if (dpi < 300) errors.push(`DPI is ${dpi}, minimum required is 300.`)
  if (widthIn <= 0 || heightIn <= 0) errors.push('Invalid dimensions calculated.')
  if (dims.bleed !== 0.125) errors.push('Bleed must be 0.125" per KDP specification.')
  if (!input.imageUrl) errors.push('No cover image provided.')

  return { valid: errors.length === 0, errors, widthIn, heightIn, dpi }
}

export async function generateKDPPdf(input: ExportInput): Promise<ExportResult> {
  const { dims, typography } = input
  const PTS_PER_INCH = 72

  // PDF points dimensions (Amazon accepts point-based PDFs)
  const pageWidthPt = dims.totalWidth * PTS_PER_INCH
  const pageHeightPt = dims.totalHeight * PTS_PER_INCH

  const pdfDoc = await PDFDocument.create()

  // Set PDF metadata
  pdfDoc.setTitle(`${input.title} — KDP Cover`)
  pdfDoc.setAuthor(input.authorName)
  pdfDoc.setCreator('KDP Cover AI')
  pdfDoc.setProducer('KDP Cover AI — kdpcoverai.com')

  const page = pdfDoc.addPage([pageWidthPt, pageHeightPt])

  // Embed and draw the AI-generated full-wrap image
  let imageBytes: Uint8Array
  let mimeType = 'image/jpeg' // default

  if (input.imageUrl.startsWith('data:')) {
    // Read mime type directly from the data URL — no guessing needed
    mimeType = input.imageUrl.split(';')[0].split(':')[1] ?? 'image/jpeg'
    const base64 = input.imageUrl.split(',')[1]
    if (!base64) throw new Error('Invalid base64 image data stored in database')
    imageBytes = new Uint8Array(Buffer.from(base64, 'base64'))
  } else {
    // External URL — fetch with timeout
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 25000)
      const res = await fetch(input.imageUrl, { signal: controller.signal, redirect: 'follow' })
      clearTimeout(timer)
      if (!res.ok) throw new Error(`Image fetch failed: ${res.status}`)
      const ct = res.headers.get('content-type') ?? ''
      if (!ct.includes('image')) throw new Error('Cover image has expired. Please generate a new cover.')
      mimeType = ct.split(';')[0].trim()
      imageBytes = new Uint8Array(await res.arrayBuffer())
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : `Failed to fetch cover image: ${e}`)
    }
  }

  // Embed directly using mime type — no sharp needed
  let embeddedImage
  if (mimeType === 'image/png') {
    embeddedImage = await pdfDoc.embedPng(imageBytes)
  } else {
    // jpeg or anything else — embed as JPEG
    try {
      embeddedImage = await pdfDoc.embedJpg(imageBytes)
    } catch {
      // last resort — try PNG
      try {
        embeddedImage = await pdfDoc.embedPng(imageBytes)
      } catch {
        throw new Error('Export failed: image could not be embedded. Please generate a new cover and try again.')
      }
    }
  }

  // Draw full-wrap image at full page size
  page.drawImage(embeddedImage, {
    x: 0,
    y: 0,
    width: pageWidthPt,
    height: pageHeightPt,
  })

  // Draw typography overlays
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)

  function ptFromPx(px: number): number { return (px / dims.ppi) * PTS_PER_INCH }

  // PDF coordinate system: origin is bottom-left, Y flips
  function pdfY(pixelY: number): number {
    return pageHeightPt - ptFromPx(pixelY)
  }

  // Draw title
  const t = typography.title
  const titleSizePt = ptFromPx(t.fontSize)
  const [tr, tg, tb] = hexToRgb(t.color)
  const titleLines = wrapText(t.text, t.width, t.fontSize, t.fontFamily)

  titleLines.forEach((line, i) => {
    const lineYPx = t.y + i * t.fontSize * t.lineHeight
    const font = t.fontWeight === '700' || t.fontWeight === '800' ? helveticaBold : helvetica
    const textWidth = font.widthOfTextAtSize(line, titleSizePt)
    const xPt = ptFromPx(t.x) + (ptFromPx(t.width) - textWidth) / 2

    page.drawText(line, {
      x: xPt,
      y: pdfY(lineYPx) - titleSizePt,
      size: titleSizePt,
      font,
      color: rgb(tr, tg, tb),
    })
  })

  // Draw subtitle
  if (typography.subtitle) {
    const s = typography.subtitle
    const subtitleSizePt = ptFromPx(s.fontSize)
    const [sr, sg, sb] = hexToRgb(s.color)
    const subtitleLines = wrapText(s.text, s.width, s.fontSize, s.fontFamily)

    subtitleLines.forEach((line, i) => {
      const lineYPx = s.y + i * s.fontSize * s.lineHeight
      const textWidth = helvetica.widthOfTextAtSize(line, subtitleSizePt)
      const xPt = ptFromPx(s.x) + (ptFromPx(s.width) - textWidth) / 2

      page.drawText(line, {
        x: xPt,
        y: pdfY(lineYPx) - subtitleSizePt,
        size: subtitleSizePt,
        font: helvetica,
        color: rgb(sr, sg, sb),
      })
    })
  }

  // Draw author name
  const a = typography.author
  const authorSizePt = ptFromPx(a.fontSize)
  const [ar, ag, ab] = hexToRgb(a.color)
  const authorWidth = helvetica.widthOfTextAtSize(a.text, authorSizePt)
  const authorXPt = ptFromPx(a.x) + (ptFromPx(a.width) - authorWidth) / 2

  page.drawText(a.text, {
    x: authorXPt,
    y: pdfY(a.y) - authorSizePt,
    size: authorSizePt,
    font: helvetica,
    color: rgb(ar, ag, ab),
  })

  // Draw spine title (rotated)
  if (typography.spineTitle) {
    const st = typography.spineTitle
    const spineSizePt = ptFromPx(st.fontSize)
    const [spr, spg, spb] = hexToRgb(st.color)
    const font = st.fontWeight === '700' ? helveticaBold : helvetica

    page.drawText(st.text, {
      x: ptFromPx(st.x),
      y: pdfY(st.y),
      size: spineSizePt,
      font,
      color: rgb(spr, spg, spb),
      rotate: degrees(-90),
    })
  }

  // Draw spine author (rotated)
  if (typography.spineAuthor) {
    const sa = typography.spineAuthor
    const saSize = ptFromPx(sa.fontSize)
    const [sar, sag, sab] = hexToRgb(sa.color)

    page.drawText(sa.text, {
      x: ptFromPx(sa.x),
      y: pdfY(sa.y),
      size: saSize,
      font: helvetica,
      color: rgb(sar, sag, sab),
      rotate: degrees(-90),
    })
  }

  // Draw back cover description
  if (input.description) {
    const { backCover } = input
    const descFontPx = Math.round(dims.ppi * 0.10)
    const descSizePt = ptFromPx(descFontPx)
    const [dr, dg, db] = hexToRgb(backCover.textColor)
    const descLines = wrapText(input.description, backCover.descriptionBox.width, descFontPx, 'body')

    descLines.slice(0, 12).forEach((line, i) => {
      const lineYPx = backCover.descriptionBox.y + i * descFontPx * 1.6
      page.drawText(line, {
        x: ptFromPx(backCover.descriptionBox.x),
        y: pdfY(lineYPx) - descSizePt,
        size: descSizePt,
        font: helvetica,
        color: rgb(dr, dg, db),
      })
    })
  }

  // Draw white barcode safe area box
  const bc = input.backCover.barcodeBox
  page.drawRectangle({
    x: ptFromPx(bc.x),
    y: pdfY(bc.y + bc.height),
    width: ptFromPx(bc.width),
    height: ptFromPx(bc.height),
    color: rgb(1, 1, 1),
  })

  // Trim marks (4 corners, outside bleed)
  const markLen = 0.1875 * PTS_PER_INCH
  const bleedPt = dims.bleed * PTS_PER_INCH
  const markColor = rgb(0, 0, 0)
  const markWidth = 0.5

  // Corners: TL, TR, BL, BR
  const corners = [
    { cx: bleedPt, cy: pageHeightPt - bleedPt },
    { cx: pageWidthPt - bleedPt, cy: pageHeightPt - bleedPt },
    { cx: bleedPt, cy: bleedPt },
    { cx: pageWidthPt - bleedPt, cy: bleedPt },
  ]
  corners.forEach(({ cx, cy }) => {
    page.drawLine({ start: { x: cx - markLen, y: cy }, end: { x: cx - 2, y: cy }, color: markColor, thickness: markWidth })
    page.drawLine({ start: { x: cx + 2, y: cy }, end: { x: cx + markLen, y: cy }, color: markColor, thickness: markWidth })
    page.drawLine({ start: { x: cx, y: cy - markLen }, end: { x: cx, y: cy - 2 }, color: markColor, thickness: markWidth })
    page.drawLine({ start: { x: cx, y: cy + 2 }, end: { x: cx, y: cy + markLen }, color: markColor, thickness: markWidth })
  })

  const pdfBytes = await pdfDoc.save()
  const pdfBuffer = Buffer.from(pdfBytes)

  return {
    pdfBuffer,
    pngPreviewBuffer: Buffer.alloc(0), // PNG preview handled separately
    widthPx: dims.totalWidthPx,
    heightPx: dims.totalHeightPx,
    fileSizeBytes: pdfBuffer.length,
  }
}

function wrapText(text: string, maxWidthPx: number, fontSizePx: number, _fontFamily: string): string[] {
  // Approximate character width: 0.55 * fontSize
  const approxCharWidth = fontSizePx * 0.55
  const charsPerLine = Math.floor(maxWidthPx / approxCharWidth)
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (test.length > charsPerLine && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}
