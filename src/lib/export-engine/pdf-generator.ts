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
  if (dims.ppi < 300) errors.push(`DPI is ${dims.ppi}, minimum required is 300.`)
  if (dims.totalWidth <= 0 || dims.totalHeight <= 0) errors.push('Invalid dimensions calculated.')
  if (dims.bleed !== 0.125) errors.push('Bleed must be 0.125" per KDP specification.')
  if (!input.imageUrl) errors.push('No cover image provided.')
  return { valid: errors.length === 0, errors, widthIn: dims.totalWidth, heightIn: dims.totalHeight, dpi: dims.ppi }
}

export async function generateKDPPdf(input: ExportInput): Promise<ExportResult> {
  const { dims, typography } = input
  const PT = 72 // points per inch

  const pageWidthPt  = dims.totalWidth  * PT
  const pageHeightPt = dims.totalHeight * PT

  const pdfDoc = await PDFDocument.create()
  pdfDoc.setTitle(`${input.title} — KDP Cover`)
  pdfDoc.setAuthor(input.authorName)
  pdfDoc.setCreator('KDP Cover AI')

  const page = pdfDoc.addPage([pageWidthPt, pageHeightPt])

  // ── 1. EMBED BACKGROUND IMAGE ──────────────────────────────────
  let imageBytes: Uint8Array
  let mimeType = 'image/jpeg'

  if (input.imageUrl.startsWith('data:')) {
    mimeType = input.imageUrl.split(';')[0].split(':')[1] ?? 'image/jpeg'
    const base64 = input.imageUrl.split(',')[1]
    if (!base64) throw new Error('Invalid base64 image data stored in database')
    imageBytes = new Uint8Array(Buffer.from(base64, 'base64'))
  } else {
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

  let embeddedImage
  if (mimeType === 'image/png') {
    embeddedImage = await pdfDoc.embedPng(imageBytes)
  } else {
    try {
      embeddedImage = await pdfDoc.embedJpg(imageBytes)
    } catch {
      try { embeddedImage = await pdfDoc.embedPng(imageBytes) }
      catch { throw new Error('Export failed: image could not be embedded. Please generate a new cover and try again.') }
    }
  }

  // Draw full-wrap background
  page.drawImage(embeddedImage, { x: 0, y: 0, width: pageWidthPt, height: pageHeightPt })

  // ── 2. FONTS ───────────────────────────────────────────────────
  const boldFont   = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const obliqueFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

  // Helpers
  function px2pt(px: number): number { return (px / dims.ppi) * PT }
  function pdfY(pixelY: number): number { return pageHeightPt - px2pt(pixelY) }

  function drawCenteredText(
    text: string, xPt: number, yPt: number, widthPt: number,
    sizePt: number, font: typeof boldFont, color: [number, number, number]
  ) {
    const tw = font.widthOfTextAtSize(text, sizePt)
    const cx = xPt + (widthPt - tw) / 2
    page.drawText(text, { x: cx, y: yPt, size: sizePt, font, color: rgb(...color) })
  }

  function wrapLines(text: string, widthPt: number, sizePt: number, font: typeof boldFont): string[] {
    const words = text.split(' ')
    const lines: string[] = []
    let cur = ''
    for (const w of words) {
      const test = cur ? cur + ' ' + w : w
      if (font.widthOfTextAtSize(test, sizePt) > widthPt && cur) {
        lines.push(cur); cur = w
      } else { cur = test }
    }
    if (cur) lines.push(cur)
    return lines
  }

  // ── 3. FRONT COVER TEXT ────────────────────────────────────────
  const frontStartPt = dims.frontCoverStartX * PT
  const frontWidthPt = dims.trimWidth * PT
  const bleedPt = dims.bleed * PT
  const safePt  = dims.safeZone * PT
  const padPt   = safePt + 0.2 * PT
  const textWidthPt = frontWidthPt - padPt * 2

  // Dark gradient overlay behind title area so text is always readable
  page.drawRectangle({
    x: frontStartPt,
    y: pageHeightPt - bleedPt - 4.2 * PT, // top 4.2" from top
    width: frontWidthPt,
    height: 3.8 * PT,
    color: rgb(0, 0, 0),
    opacity: 0.55,
  })

  // TITLE — large bold white
  const t = typography.title
  const titleSizePt = px2pt(t.fontSize)
  const titleLines  = wrapLines(t.text, textWidthPt, titleSizePt, boldFont)

  titleLines.forEach((line, i) => {
    const yPt = pdfY(t.y) - titleSizePt - i * titleSizePt * t.lineHeight
    drawCenteredText(line, frontStartPt + padPt, yPt, textWidthPt, titleSizePt, boldFont, [1, 1, 1])
  })

  // SUBTITLE — italic white, below title
  if (typography.subtitle) {
    const s = typography.subtitle
    const subSizePt = px2pt(s.fontSize)
    const subLines  = wrapLines(s.text, textWidthPt, subSizePt, obliqueFont)
    subLines.forEach((line, i) => {
      const yPt = pdfY(s.y) - subSizePt - i * subSizePt * s.lineHeight
      drawCenteredText(line, frontStartPt + padPt, yPt, textWidthPt, subSizePt, obliqueFont, [0.88, 0.88, 0.88])
    })
  }

  // Thin gold decorative line above author name
  const lineY = pdfY(typography.author.y) + px2pt(typography.author.fontSize) + 0.12 * PT
  page.drawLine({
    start: { x: frontStartPt + padPt + textWidthPt * 0.2, y: lineY },
    end:   { x: frontStartPt + padPt + textWidthPt * 0.8, y: lineY },
    thickness: 1.5,
    color: rgb(0.85, 0.72, 0.35), // gold
  })

  // Dark overlay behind author name at bottom
  page.drawRectangle({
    x: frontStartPt,
    y: bleedPt,
    width: frontWidthPt,
    height: 1.2 * PT,
    color: rgb(0, 0, 0),
    opacity: 0.55,
  })

  // AUTHOR NAME — bold white, letter-spaced, bottom of front cover
  const a = typography.author
  const authorSizePt = px2pt(a.fontSize)
  const authorYPt = pdfY(a.y) - authorSizePt
  drawCenteredText(a.text, frontStartPt + padPt, authorYPt, textWidthPt, authorSizePt, boldFont, [1, 1, 1])

  // ── 4. SPINE TEXT ──────────────────────────────────────────────
  if (typography.spineTitle && dims.spineWidth >= 0.2) {
    const st = typography.spineTitle
    const spineSizePt = px2pt(st.fontSize)
    const spineCenterX = dims.spineStartX * PT + (dims.spineWidth * PT) / 2

    page.drawText(st.text, {
      x: spineCenterX - spineSizePt * 0.3,
      y: bleedPt + safePt + 0.4 * PT,
      size: spineSizePt,
      font: boldFont,
      color: rgb(1, 1, 1),
      rotate: degrees(90),
    })

    if (typography.spineAuthor) {
      const sa = typography.spineAuthor
      const saSizePt = px2pt(sa.fontSize)
      page.drawText(sa.text, {
        x: spineCenterX - saSizePt * 0.3,
        y: pageHeightPt - bleedPt - safePt - 0.3 * PT,
        size: saSizePt,
        font: regularFont,
        color: rgb(0.9, 0.9, 0.9),
        rotate: degrees(90),
      })
    }
  }

  // ── 5. BACK COVER ─────────────────────────────────────────────
  const { backCover } = input
  const backStartPt  = dims.backCoverStartX * PT
  const backWidthPt  = dims.trimWidth * PT
  const backPadPt    = padPt
  const backTextWidthPt = backWidthPt - backPadPt * 2
  const backContentX = backStartPt + backPadPt

  // Semi-transparent dark overlay over entire back cover for readability
  page.drawRectangle({
    x: backStartPt,
    y: bleedPt,
    width: backWidthPt,
    height: pageHeightPt - bleedPt * 2,
    color: rgb(0, 0, 0),
    opacity: 0.50,
  })

  let currentYPt = pageHeightPt - bleedPt - safePt - 0.5 * PT

  // ── "ABOUT THE BOOK" LABEL ────────────────────────────────────
  const labelSizePt = 9
  const descSizePt  = 9.5
  const bioSizePt   = 9
  const lineHeightDesc = descSizePt * 1.55
  const lineHeightBio  = bioSizePt  * 1.5

  page.drawText('ABOUT THE BOOK', {
    x: backContentX,
    y: currentYPt - labelSizePt,
    size: labelSizePt,
    font: boldFont,
    color: rgb(0.85, 0.72, 0.35), // gold accent
  })
  currentYPt -= labelSizePt + 0.18 * PT

  // Gold underline under label
  page.drawLine({
    start: { x: backContentX, y: currentYPt },
    end:   { x: backContentX + backTextWidthPt, y: currentYPt },
    thickness: 0.8,
    color: rgb(0.85, 0.72, 0.35),
  })
  currentYPt -= 0.18 * PT

  // ── DESCRIPTION TEXT ──────────────────────────────────────────
  if (input.description) {
    const descLines = wrapLines(input.description, backTextWidthPt, descSizePt, regularFont)
    const maxDescLines = 10
    descLines.slice(0, maxDescLines).forEach(line => {
      page.drawText(line, {
        x: backContentX,
        y: currentYPt - descSizePt,
        size: descSizePt,
        font: regularFont,
        color: rgb(0.95, 0.95, 0.95),
      })
      currentYPt -= lineHeightDesc
    })
  }

  currentYPt -= 0.35 * PT

  // White divider line between sections
  page.drawLine({
    start: { x: backContentX, y: currentYPt },
    end:   { x: backContentX + backTextWidthPt, y: currentYPt },
    thickness: 0.5,
    color: rgb(0.6, 0.6, 0.6),
  })
  currentYPt -= 0.28 * PT

  // ── "ABOUT THE AUTHOR" LABEL ──────────────────────────────────
  page.drawText('ABOUT THE AUTHOR', {
    x: backContentX,
    y: currentYPt - labelSizePt,
    size: labelSizePt,
    font: boldFont,
    color: rgb(0.85, 0.72, 0.35), // gold accent
  })
  currentYPt -= labelSizePt + 0.18 * PT

  // Gold underline
  page.drawLine({
    start: { x: backContentX, y: currentYPt },
    end:   { x: backContentX + backTextWidthPt, y: currentYPt },
    thickness: 0.8,
    color: rgb(0.85, 0.72, 0.35),
  })
  currentYPt -= 0.18 * PT

  // ── AUTHOR BIO TEXT ───────────────────────────────────────────
  const bioText = input.authorBio ?? input.authorName
  const bioLines = wrapLines(bioText, backTextWidthPt, bioSizePt, regularFont)
  bioLines.slice(0, 6).forEach(line => {
    page.drawText(line, {
      x: backContentX,
      y: currentYPt - bioSizePt,
      size: bioSizePt,
      font: regularFont,
      color: rgb(0.9, 0.9, 0.9),
    })
    currentYPt -= lineHeightBio
  })

  // ── 6. BARCODE WHITE BOX — bottom-right of back cover ─────────
  const bc = backCover.barcodeBox
  page.drawRectangle({
    x: px2pt(bc.x),
    y: pdfY(bc.y + bc.height),
    width: px2pt(bc.width),
    height: px2pt(bc.height),
    color: rgb(1, 1, 1),
  })

  // ── 7. TRIM MARKS ─────────────────────────────────────────────
  const markLen   = 0.1875 * PT
  const markColor = rgb(0, 0, 0)
  const corners = [
    { cx: bleedPt,              cy: pageHeightPt - bleedPt },
    { cx: pageWidthPt - bleedPt, cy: pageHeightPt - bleedPt },
    { cx: bleedPt,              cy: bleedPt },
    { cx: pageWidthPt - bleedPt, cy: bleedPt },
  ]
  corners.forEach(({ cx, cy }) => {
    page.drawLine({ start: { x: cx - markLen, y: cy }, end: { x: cx - 2, y: cy }, color: markColor, thickness: 0.5 })
    page.drawLine({ start: { x: cx + 2,       y: cy }, end: { x: cx + markLen, y: cy }, color: markColor, thickness: 0.5 })
    page.drawLine({ start: { x: cx, y: cy - markLen }, end: { x: cx, y: cy - 2 }, color: markColor, thickness: 0.5 })
    page.drawLine({ start: { x: cx, y: cy + 2       }, end: { x: cx, y: cy + markLen }, color: markColor, thickness: 0.5 })
  })

  const pdfBytes = await pdfDoc.save()
  const pdfBuffer = Buffer.from(pdfBytes)

  return {
    pdfBuffer,
    pngPreviewBuffer: Buffer.alloc(0),
    widthPx: dims.totalWidthPx,
    heightPx: dims.totalHeightPx,
    fileSizeBytes: pdfBuffer.length,
  }
}
