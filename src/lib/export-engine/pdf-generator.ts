import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib'
import type { ExportInput, ExportResult, ExportValidation } from './types'

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16) / 255
  const g = parseInt(clean.substring(2, 4), 16) / 255
  const b = parseInt(clean.substring(4, 6), 16) / 255
  return [r, g, b]
}

// Fix: strip newline/tab chars — WinAnsi (Helvetica) cannot encode \n (0x000a)
function cleanText(text: string): string {
  return text.replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim()
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
  const PT = 72

  const pageWidthPt  = dims.totalWidth  * PT
  const pageHeightPt = dims.totalHeight * PT

  const pdfDoc = await PDFDocument.create()
  pdfDoc.setTitle(cleanText(`${input.title} — KDP Cover`))
  pdfDoc.setAuthor(cleanText(input.authorName))
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
    try { embeddedImage = await pdfDoc.embedJpg(imageBytes) }
    catch {
      try { embeddedImage = await pdfDoc.embedPng(imageBytes) }
      catch { throw new Error('Export failed: image could not be embedded. Please generate a new cover.') }
    }
  }

  page.drawImage(embeddedImage, { x: 0, y: 0, width: pageWidthPt, height: pageHeightPt })

  // ── 2. FONTS ───────────────────────────────────────────────────
  const boldFont    = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const obliqueFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

  function px2pt(px: number): number { return (px / dims.ppi) * PT }
  function pdfY(pixelY: number): number { return pageHeightPt - px2pt(pixelY) }

  function drawCenteredText(
    text: string, xPt: number, yPt: number, widthPt: number,
    sizePt: number, font: typeof boldFont, color: [number, number, number]
  ) {
    const safe = cleanText(text)
    const tw = font.widthOfTextAtSize(safe, sizePt)
    const cx = xPt + (widthPt - tw) / 2
    page.drawText(safe, { x: cx, y: yPt, size: sizePt, font, color: rgb(...color) })
  }

  function wrapLines(rawText: string, widthPt: number, sizePt: number, font: typeof boldFont): string[] {
    const text = cleanText(rawText)
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

  // ── 3. LAYOUT CONSTANTS ────────────────────────────────────────
  const bleedPt = dims.bleed     * PT
  const safePt  = dims.safeZone  * PT
  const padPt   = safePt + 0.2 * PT

  const frontStartPt   = dims.frontCoverStartX  * PT
  const frontWidthPt   = dims.trimWidth          * PT
  const backStartPt    = dims.backCoverStartX    * PT
  const backWidthPt    = dims.trimWidth          * PT
  const spineStartPt   = dims.spineStartX        * PT
  const spineWidthPt   = dims.spineWidth         * PT
  const textWidthPt    = frontWidthPt - padPt * 2
  const backTextWidthPt = backWidthPt - padPt * 2
  const backContentX   = backStartPt + padPt

  // ── 4. FRONT COVER ────────────────────────────────────────────

  // Dark overlay — top area behind title
  page.drawRectangle({
    x: frontStartPt, y: pageHeightPt - bleedPt - 4.0 * PT,
    width: frontWidthPt, height: 3.6 * PT,
    color: rgb(0, 0, 0), opacity: 0.58,
  })

  // Dark overlay — bottom area behind author name
  page.drawRectangle({
    x: frontStartPt, y: bleedPt,
    width: frontWidthPt, height: 1.3 * PT,
    color: rgb(0, 0, 0), opacity: 0.58,
  })

  // TITLE — large bold white
  const t = typography.title
  const titleSizePt = px2pt(t.fontSize)
  const titleLines  = wrapLines(t.text, textWidthPt, titleSizePt, boldFont)
  titleLines.forEach((line, i) => {
    const yPt = pdfY(t.y) - titleSizePt - i * titleSizePt * t.lineHeight
    drawCenteredText(line, frontStartPt + padPt, yPt, textWidthPt, titleSizePt, boldFont, [1, 1, 1])
  })

  // SUBTITLE — oblique grey
  if (typography.subtitle) {
    const s = typography.subtitle
    const subSizePt = px2pt(s.fontSize)
    const subLines  = wrapLines(s.text, textWidthPt, subSizePt, obliqueFont)
    subLines.forEach((line, i) => {
      const yPt = pdfY(s.y) - subSizePt - i * subSizePt * s.lineHeight
      drawCenteredText(line, frontStartPt + padPt, yPt, textWidthPt, subSizePt, obliqueFont, [0.88, 0.88, 0.88])
    })
  }

  // Gold line above author
  const goldLineY = pdfY(typography.author.y) + px2pt(typography.author.fontSize) + 0.14 * PT
  page.drawLine({
    start: { x: frontStartPt + padPt + textWidthPt * 0.2, y: goldLineY },
    end:   { x: frontStartPt + padPt + textWidthPt * 0.8, y: goldLineY },
    thickness: 1.5, color: rgb(0.85, 0.72, 0.35),
  })

  // AUTHOR NAME — bold white all-caps
  const a = typography.author
  const authorSizePt = px2pt(a.fontSize)
  drawCenteredText(a.text, frontStartPt + padPt, pdfY(a.y) - authorSizePt, textWidthPt, authorSizePt, boldFont, [1, 1, 1])

  // ── 5. SPINE ──────────────────────────────────────────────────
  if (dims.spineWidth >= 0.2) {
    const spineCX = spineStartPt + spineWidthPt / 2
    const maxSpineFontPt = Math.min(spineWidthPt * 0.75, 10)

    // Dark spine background so text is always readable
    page.drawRectangle({
      x: spineStartPt, y: bleedPt,
      width: spineWidthPt, height: pageHeightPt - bleedPt * 2,
      color: rgb(0, 0, 0), opacity: 0.45,
    })

    // Spine title — centered, reads bottom-to-top
    const spineTitle = cleanText(t.text)
    page.drawText(spineTitle, {
      x: spineCX - maxSpineFontPt * 0.35,
      y: bleedPt + safePt + 0.5 * PT,
      size: maxSpineFontPt,
      font: boldFont,
      color: rgb(1, 1, 1),
      rotate: degrees(90),
    })

    // Spine author — at top of spine, reads bottom-to-top
    const spineAuthor = cleanText(input.authorName.toUpperCase())
    const spineAuthorFontPt = Math.min(maxSpineFontPt * 0.75, 8)
    page.drawText(spineAuthor, {
      x: spineCX - spineAuthorFontPt * 0.35,
      y: pageHeightPt - bleedPt - safePt - 0.3 * PT,
      size: spineAuthorFontPt,
      font: boldFont,
      color: rgb(0.85, 0.72, 0.35),
      rotate: degrees(90),
    })
  }

  // ── 6. BACK COVER ────────────────────────────────────────────

  // Dark overlay over full back cover
  page.drawRectangle({
    x: backStartPt, y: bleedPt,
    width: backWidthPt, height: pageHeightPt - bleedPt * 2,
    color: rgb(0, 0, 0), opacity: 0.52,
  })

  const labelSizePt    = 8.5
  const descSizePt     = 9.0
  const bioSizePt      = 8.5
  const lineHeightDesc = descSizePt * 1.6
  const lineHeightBio  = bioSizePt  * 1.6
  const boxPad         = 0.15 * PT  // inner padding inside each box

  let curY = pageHeightPt - bleedPt - safePt - 0.4 * PT

  // Helper: draw a labeled section box (gold border, label, text inside)
  function drawSectionBox(
    label: string, bodyText: string, font: typeof regularFont,
    bodySizePt: number, lineH: number, maxLines: number
  ) {
    const bodyLines = wrapLines(bodyText, backTextWidthPt - boxPad * 2, bodySizePt, font).slice(0, maxLines)
    const boxHeight = labelSizePt + 0.12 * PT + boxPad + bodyLines.length * lineH + boxPad + 0.1 * PT

    // Box background
    page.drawRectangle({
      x: backContentX, y: curY - boxHeight,
      width: backTextWidthPt, height: boxHeight,
      color: rgb(0, 0, 0), opacity: 0.35,
      borderColor: rgb(0.85, 0.72, 0.35),
      borderWidth: 0.8,
    })

    // Label inside top of box
    page.drawText(label, {
      x: backContentX + boxPad,
      y: curY - labelSizePt - boxPad * 0.5,
      size: labelSizePt, font: boldFont,
      color: rgb(0.85, 0.72, 0.35),
    })

    // Gold underline below label
    const underlineY = curY - labelSizePt - boxPad * 0.5 - 0.1 * PT
    page.drawLine({
      start: { x: backContentX + boxPad, y: underlineY },
      end:   { x: backContentX + backTextWidthPt - boxPad, y: underlineY },
      thickness: 0.6, color: rgb(0.85, 0.72, 0.35),
    })

    // Body text
    let textY = underlineY - 0.15 * PT
    bodyLines.forEach(line => {
      page.drawText(line, {
        x: backContentX + boxPad,
        y: textY - bodySizePt,
        size: bodySizePt, font,
        color: rgb(0.95, 0.95, 0.95),
      })
      textY -= lineH
    })

    curY -= boxHeight + 0.28 * PT // gap between boxes
  }

  // ABOUT THE BOOK box
  if (input.description) {
    drawSectionBox('ABOUT THE BOOK', input.description, regularFont, descSizePt, lineHeightDesc, 10)
  }

  // ABOUT THE AUTHOR box
  const bioText = input.authorBio ?? ''
  if (bioText) {
    drawSectionBox('ABOUT THE AUTHOR', bioText, obliqueFont, bioSizePt, lineHeightBio, 6)
  }

  // ── 7. BARCODE WHITE BOX — bottom-right, reserved for Amazon ──
  const bc = input.backCover.barcodeBox
  page.drawRectangle({
    x: px2pt(bc.x), y: pdfY(bc.y + bc.height),
    width: px2pt(bc.width), height: px2pt(bc.height),
    color: rgb(1, 1, 1),
  })

  // ── 8. TRIM MARKS ─────────────────────────────────────────────
  const markLen = 0.1875 * PT
  const corners = [
    { cx: bleedPt,               cy: pageHeightPt - bleedPt },
    { cx: pageWidthPt - bleedPt, cy: pageHeightPt - bleedPt },
    { cx: bleedPt,               cy: bleedPt },
    { cx: pageWidthPt - bleedPt, cy: bleedPt },
  ]
  corners.forEach(({ cx, cy }) => {
    page.drawLine({ start: { x: cx - markLen, y: cy }, end: { x: cx - 2, y: cy }, color: rgb(0,0,0), thickness: 0.5 })
    page.drawLine({ start: { x: cx + 2, y: cy },       end: { x: cx + markLen, y: cy }, color: rgb(0,0,0), thickness: 0.5 })
    page.drawLine({ start: { x: cx, y: cy - markLen }, end: { x: cx, y: cy - 2 }, color: rgb(0,0,0), thickness: 0.5 })
    page.drawLine({ start: { x: cx, y: cy + 2 },       end: { x: cx, y: cy + markLen }, color: rgb(0,0,0), thickness: 0.5 })
  })

  const pdfBytes  = await pdfDoc.save()
  const pdfBuffer = Buffer.from(pdfBytes)

  return {
    pdfBuffer,
    pngPreviewBuffer: Buffer.alloc(0),
    widthPx: dims.totalWidthPx,
    heightPx: dims.totalHeightPx,
    fileSizeBytes: pdfBuffer.length,
  }
}
