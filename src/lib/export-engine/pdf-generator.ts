import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib'
import type { ExportInput, ExportResult, ExportValidation } from './types'

// Strip/replace chars WinAnsi (pdf-lib standard fonts) cannot encode
function cleanText(text: string): string {
  return text
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/—/g, ' - ')   // em dash
    .replace(/–/g, ' - ')   // en dash
    .replace(/‘|’/g, "'")   // smart single quotes
    .replace(/“|”/g, '"')   // smart double quotes
    .replace(/…/g, '...')   // ellipsis
    .replace(/ /g, ' ')     // non-breaking space
    .replace(/[^\x20-\xFF]/g, '') // strip anything outside WinAnsi range
    .replace(/\s{2,}/g, ' ')
    .trim()
}

// Count words to dynamically size text
function wordCount(text: string): number {
  return cleanText(text).split(' ').filter(Boolean).length
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
  const style = input.titleStyle ?? 'bold-sans'
  const titleFont = await pdfDoc.embedFont(
    style === 'serif'         ? StandardFonts.TimesRomanBold :
    style === 'serif-italic'  ? StandardFonts.TimesRomanBoldItalic :
    style === 'serif-light'   ? StandardFonts.TimesRomanItalic :
    style === 'sans-oblique'  ? StandardFonts.HelveticaBoldOblique :
    style === 'courier-bold'  ? StandardFonts.CourierBold :
                                StandardFonts.HelveticaBold
  )
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
  const bleedPt = dims.bleed    * PT
  const safePt  = dims.safeZone * PT
  const padPt   = safePt + 0.2 * PT

  const frontStartPt    = dims.frontCoverStartX * PT
  const frontWidthPt    = dims.trimWidth         * PT
  const backStartPt     = dims.backCoverStartX   * PT
  const backWidthPt     = dims.trimWidth          * PT
  const spineStartPt    = dims.spineStartX        * PT
  const spineWidthPt    = dims.spineWidth         * PT
  const textWidthPt     = frontWidthPt - padPt * 2
  const backTextWidthPt = backWidthPt  - padPt * 2
  const backContentX    = backStartPt  + padPt

  // ── 4. FRONT COVER ────────────────────────────────────────────
  const t     = typography.title
  const scale = Math.max(0.5, Math.min(1.6, input.titleFontScale ?? 1.0))
  const titleSizePt = px2pt(t.fontSize) * scale
  const titleLines  = wrapLines(t.text, textWidthPt, titleSizePt, titleFont)

  // Dark overlay sized to actual title height
  const titleTopPt    = pdfY(t.y)
  const titleBottomPt = titleTopPt - titleSizePt - (titleLines.length - 1) * titleSizePt * t.lineHeight
  page.drawRectangle({
    x: frontStartPt, y: titleBottomPt - 0.2 * PT,
    width: frontWidthPt,
    height: titleTopPt - titleBottomPt + titleSizePt + 0.4 * PT,
    color: rgb(0, 0, 0), opacity: 0.5,
  })

  // Title lines
  titleLines.forEach((line, i) => {
    const yPt = titleTopPt - titleSizePt - i * titleSizePt * t.lineHeight
    drawCenteredText(line, frontStartPt + padPt, yPt, textWidthPt, titleSizePt, titleFont, [1, 1, 1])
  })

  // Subtitle — below actual last title line, never overlapping
  if (typography.subtitle) {
    const s = typography.subtitle
    const subSizePt = px2pt(s.fontSize) * scale
    const subLines  = wrapLines(s.text, textWidthPt, subSizePt, obliqueFont)
    const subTopPt  = titleBottomPt - 0.25 * PT
    subLines.forEach((line, i) => {
      const yPt = subTopPt - subSizePt - i * subSizePt * s.lineHeight
      drawCenteredText(line, frontStartPt + padPt, yPt, textWidthPt, subSizePt, obliqueFont, [0.88, 0.88, 0.88])
    })
  }

  // Gold line above author
  const a = typography.author
  const authorSizePt = px2pt(a.fontSize)
  const authorBaseY  = pdfY(a.y) - authorSizePt
  const goldLineY    = authorBaseY + authorSizePt + 0.25 * PT
  page.drawLine({
    start: { x: frontStartPt + padPt + textWidthPt * 0.2, y: goldLineY },
    end:   { x: frontStartPt + padPt + textWidthPt * 0.8, y: goldLineY },
    thickness: 1.5, color: rgb(0.85, 0.72, 0.35),
  })

  // Dark overlay behind author
  page.drawRectangle({
    x: frontStartPt, y: bleedPt,
    width: frontWidthPt, height: authorSizePt + 0.6 * PT,
    color: rgb(0, 0, 0), opacity: 0.58,
  })

  // Author name — bold white all-caps
  drawCenteredText(a.text, frontStartPt + padPt, authorBaseY, textWidthPt, authorSizePt, boldFont, [1, 1, 1])

  // ── 5. SPINE ──────────────────────────────────────────────────
  if (dims.spineWidth >= 0.2) {
    const spineCX = spineStartPt + spineWidthPt / 2

    // Spine font: proportional to spine width, no tiny cap
    // For 0.75" spine (54pt): titleFont = min(54*0.6, 18) = 18pt — bold and readable
    const spineTitleFontPt  = Math.min(spineWidthPt * 0.60, 18)
    const spineAuthorFontPt = Math.min(spineWidthPt * 0.42, 13)

    // Dark spine background
    page.drawRectangle({
      x: spineStartPt, y: bleedPt,
      width: spineWidthPt, height: pageHeightPt - bleedPt * 2,
      color: rgb(0, 0, 0), opacity: 0.50,
    })

    // Spine title — reads bottom-to-top, starts near bottom safe zone
    const spineTitle = cleanText(t.text)
    page.drawText(spineTitle, {
      x: spineCX - spineTitleFontPt * 0.35,
      y: bleedPt + safePt + 0.5 * PT,
      size: spineTitleFontPt,
      font: boldFont,
      color: rgb(1, 1, 1),
      rotate: degrees(90),
    })

    // Spine author — positioned so it ENDS exactly at top safe zone (no clipping)
    const spineAuthor = cleanText(input.authorName.toUpperCase())
    const spineAuthorTextWidth = boldFont.widthOfTextAtSize(spineAuthor, spineAuthorFontPt)
    const spineAuthorY = pageHeightPt - bleedPt - safePt - spineAuthorTextWidth - 0.15 * PT
    page.drawText(spineAuthor, {
      x: spineCX - spineAuthorFontPt * 0.35,
      y: spineAuthorY,
      size: spineAuthorFontPt,
      font: boldFont,
      color: rgb(0.85, 0.72, 0.35),
      rotate: degrees(90),
    })
  }

  // ── 6. BACK COVER ────────────────────────────────────────────

  page.drawRectangle({
    x: backStartPt, y: bleedPt,
    width: backWidthPt, height: pageHeightPt - bleedPt * 2,
    color: rgb(0, 0, 0), opacity: 0.55,
  })

  // Dynamic font size based on how much content we have
  const descWords = wordCount(input.description ?? '')
  const descSizePt = descWords > 180 ? 8.5 : descWords > 100 ? 10 : 12
  const lineHeightDesc = descSizePt * 1.65

  let curY = pageHeightPt - bleedPt - safePt - 0.4 * PT

  // ── ABOUT THE BOOK — plain text, no box ──────────────────────
  if (input.description) {
    const labelSizePt = Math.min(descSizePt * 1.0, 11)
    const bodyLines = wrapLines(input.description, backTextWidthPt, descSizePt, regularFont).slice(0, 14)

    // Gold label only — no box border
    page.drawText('ABOUT THE BOOK', {
      x: backContentX,
      y: curY - labelSizePt,
      size: labelSizePt, font: boldFont,
      color: rgb(0.85, 0.72, 0.35),
    })

    const underlineY = curY - labelSizePt - 0.1 * PT
    page.drawLine({
      start: { x: backContentX, y: underlineY },
      end:   { x: backContentX + backTextWidthPt * 0.4, y: underlineY },
      thickness: 0.7, color: rgb(0.85, 0.72, 0.35),
    })

    let textY = underlineY - 0.18 * PT
    bodyLines.forEach(line => {
      page.drawText(line, {
        x: backContentX, y: textY - descSizePt,
        size: descSizePt, font: regularFont,
        color: rgb(0.95, 0.95, 0.95),
      })
      textY -= lineHeightDesc
    })

    curY = textY - 0.3 * PT
  }

  // ── REVIEW QUOTE ──────────────────────────────────────────────
  if (input.reviewQuote) {
    const quoteSizePt = 9.5
    const quoteLineH  = quoteSizePt * 1.6
    const quoteText   = cleanText(`"${input.reviewQuote}"`)
    const quoteLines  = wrapLines(quoteText, backTextWidthPt, quoteSizePt, obliqueFont).slice(0, 3)

    curY -= 0.2 * PT
    quoteLines.forEach(line => {
      page.drawText(line, {
        x: backContentX, y: curY - quoteSizePt,
        size: quoteSizePt, font: obliqueFont,
        color: rgb(0.85, 0.72, 0.35),
      })
      curY -= quoteLineH
    })

    if (input.reviewAttribution) {
      const attrText = cleanText(input.reviewAttribution)
      page.drawText(attrText, {
        x: backContentX, y: curY - 8,
        size: 8, font: regularFont,
        color: rgb(0.65, 0.65, 0.65),
      })
      curY -= 8 * 1.5
    }
    curY -= 0.2 * PT
  }

  // ── ABOUT THE AUTHOR — plain text, no box ─────────────────────
  const bioText = cleanText(input.authorBio ?? '')
  if (bioText) {
    const bioWords = wordCount(bioText)
    const bioSizePt = bioWords > 80 ? 8.5 : bioWords > 40 ? 10 : 11
    const bioLineH  = bioSizePt * 1.65
    const bioLines  = wrapLines(bioText, backTextWidthPt, bioSizePt, obliqueFont).slice(0, 5)

    // Gold separator line
    page.drawLine({
      start: { x: backContentX, y: curY - 0.05 * PT },
      end:   { x: backContentX + backTextWidthPt, y: curY - 0.05 * PT },
      thickness: 0.6, color: rgb(0.85, 0.72, 0.35),
    })
    curY -= 0.3 * PT

    // "ABOUT THE AUTHOR" label — no box, just gold label
    const bioLabelSizePt = Math.min(bioSizePt * 0.9, 9)
    page.drawText('ABOUT THE AUTHOR', {
      x: backContentX, y: curY - bioLabelSizePt,
      size: bioLabelSizePt, font: boldFont,
      color: rgb(0.85, 0.72, 0.35),
    })
    curY -= bioLabelSizePt + 0.18 * PT

    // Bio text in italic, directly on background
    bioLines.forEach(line => {
      page.drawText(line, {
        x: backContentX, y: curY - bioSizePt,
        size: bioSizePt, font: obliqueFont,
        color: rgb(0.88, 0.88, 0.88),
      })
      curY -= bioLineH
    })
    curY -= 0.2 * PT
  }

  // ── 7. ISBN — above barcode, bottom-left of back cover ────────
  const bc = input.backCover.barcodeBox
  const barcodeTopPt  = pdfY(bc.y)
  const barcodeLeftPt = px2pt(bc.x)

  if (input.isbn) {
    const isbnText = cleanText(`ISBN ${input.isbn}`)
    page.drawText(isbnText, {
      x: barcodeLeftPt,
      y: barcodeTopPt + 0.1 * PT,
      size: 7, font: regularFont,
      color: rgb(0.8, 0.8, 0.8),
    })
  }

  // ── 8. BARCODE ────────────────────────────────────────────────
  const barcodeWidthPt  = px2pt(bc.width)
  const barcodeHeightPt = px2pt(bc.height)
  const barcodeBottomPt = pdfY(bc.y + bc.height)

  if (input.barcodeImageBase64) {
    // Embed user-uploaded barcode image
    try {
      const barcodeMime  = input.barcodeImageBase64.split(';')[0].split(':')[1] ?? 'image/png'
      const barcodeB64   = input.barcodeImageBase64.split(',')[1]
      const barcodeBytes = new Uint8Array(Buffer.from(barcodeB64, 'base64'))
      let barcodeImg
      if (barcodeMime === 'image/png') {
        barcodeImg = await pdfDoc.embedPng(barcodeBytes)
      } else {
        barcodeImg = await pdfDoc.embedJpg(barcodeBytes)
      }
      // White background behind barcode
      page.drawRectangle({ x: barcodeLeftPt, y: barcodeBottomPt, width: barcodeWidthPt, height: barcodeHeightPt, color: rgb(1, 1, 1) })
      page.drawImage(barcodeImg, { x: barcodeLeftPt + 4, y: barcodeBottomPt + 4, width: barcodeWidthPt - 8, height: barcodeHeightPt - 8 })
    } catch {
      // Fall back to white box if barcode embed fails
      page.drawRectangle({ x: barcodeLeftPt, y: barcodeBottomPt, width: barcodeWidthPt, height: barcodeHeightPt, color: rgb(1, 1, 1) })
    }
  } else {
    // White box — Amazon fills this in when you upload to KDP
    page.drawRectangle({ x: barcodeLeftPt, y: barcodeBottomPt, width: barcodeWidthPt, height: barcodeHeightPt, color: rgb(1, 1, 1) })
    page.drawText('BARCODE', {
      x: barcodeLeftPt + barcodeWidthPt * 0.28,
      y: barcodeBottomPt + barcodeHeightPt * 0.42,
      size: 8, font: regularFont, color: rgb(0.7, 0.7, 0.7),
    })
  }

  // ── 9. TRIM MARKS ─────────────────────────────────────────────
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
