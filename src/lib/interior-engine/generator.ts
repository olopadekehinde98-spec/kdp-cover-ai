import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont, RGB, degrees } from 'pdf-lib'
import type { InteriorInput, InteriorDimensions, InteriorResult, HabitTrackerConfig } from './types'
import { calculateInteriorDimensions } from './calculator'

// ── Colour helpers ──────────────────────────────────────────────────────────

function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  return rgb(r, g, b)
}

function accentColor(primaryColor?: string): RGB {
  if (primaryColor) {
    try { return hexToRgb(primaryColor) } catch { /* ignore */ }
  }
  return rgb(0.48, 0.22, 0.93) // violet default
}

// ── Line-spacing values (in points) ────────────────────────────────────────

function lineSpacingPt(spacing?: string): number {
  if (spacing === 'narrow') return 18
  if (spacing === 'wide')   return 30
  return 24 // medium default
}

// ── Single-page template drawing functions ──────────────────────────────────

/** Lined journal page */
function drawLined(
  page: PDFPage,
  dims: InteriorDimensions,
  isRecto: boolean,     // true = right-hand (odd) page
  opts: { accent: RGB; spacing: number; headerText?: string; hasHeader: boolean; hasPageNumbers: boolean; pageNum: number },
) {
  const PT = dims.pt
  const { width, height } = page.getSize()
  const insidePt  = dims.insideMargin  * PT
  const outsidePt = dims.outsideMargin * PT
  const topPt     = dims.topMargin     * PT
  const bottomPt  = dims.bottomMargin  * PT

  // For recto pages inside is on the left; for verso it's on the right
  const leftPt  = isRecto ? insidePt  : outsidePt
  const rightPt = isRecto ? outsidePt : insidePt
  const textW   = width - leftPt - rightPt
  const textH   = height - topPt - bottomPt

  // Optional header rule
  if (opts.hasHeader) {
    const headerY = height - topPt + 10
    page.drawLine({
      start: { x: leftPt, y: headerY - 4 },
      end:   { x: leftPt + textW, y: headerY - 4 },
      thickness: 1.5, color: opts.accent,
    })
    if (opts.headerText) {
      // We can't embed custom fonts without async, but can add label
    }
  }

  // Draw horizontal lines
  const startY  = height - topPt
  const endY    = bottomPt
  let y = startY - opts.spacing
  while (y >= endY) {
    page.drawLine({
      start: { x: leftPt, y },
      end:   { x: leftPt + textW, y },
      thickness: 0.4,
      color: rgb(0.82, 0.82, 0.86),
    })
    y -= opts.spacing
  }

  // Optional left accent line (like a ruled notebook)
  page.drawLine({
    start: { x: leftPt + 28, y: height - topPt + 6 },
    end:   { x: leftPt + 28, y: bottomPt },
    thickness: 0.7,
    color: rgb(opts.accent.red, opts.accent.green, opts.accent.blue, ),
    opacity: 0.35,
  })

  // Page numbers
  if (opts.hasPageNumbers) {
    const numStr = String(opts.pageNum)
    const numX   = isRecto ? (width - rightPt - 20) : (leftPt + 4)
    page.drawText(numStr, { x: numX, y: 22, size: 8, color: rgb(0.6, 0.6, 0.65) })
  }
}

/** Dotted notebook page */
function drawDotted(
  page: PDFPage,
  dims: InteriorDimensions,
  isRecto: boolean,
  opts: { accent: RGB; spacing: number; hasPageNumbers: boolean; pageNum: number },
) {
  const PT = dims.pt
  const { width, height } = page.getSize()
  const insidePt  = dims.insideMargin  * PT
  const outsidePt = dims.outsideMargin * PT
  const topPt     = dims.topMargin     * PT
  const bottomPt  = dims.bottomMargin  * PT
  const leftPt    = isRecto ? insidePt : outsidePt
  const rightPt   = isRecto ? outsidePt : insidePt
  const textW     = width - leftPt - rightPt

  // Convert spacing from lines to dot grid (roughly half)
  const dotSpacing = opts.spacing * 0.5

  let y = height - topPt
  while (y >= bottomPt) {
    let x = leftPt
    while (x <= leftPt + textW) {
      page.drawCircle({ x, y, size: 0.8, color: rgb(0.78, 0.78, 0.83) })
      x += dotSpacing
    }
    y -= dotSpacing
  }

  if (opts.hasPageNumbers) {
    const numStr = String(opts.pageNum)
    const numX   = isRecto ? (width - rightPt - 20) : (leftPt + 4)
    page.drawText(numStr, { x: numX, y: 22, size: 8, color: rgb(0.6, 0.6, 0.65) })
  }
}

/** Graph / grid paper */
function drawGraph(
  page: PDFPage,
  dims: InteriorDimensions,
  isRecto: boolean,
  opts: { accent: RGB; hasPageNumbers: boolean; pageNum: number },
) {
  const PT = dims.pt
  const { width, height } = page.getSize()
  const insidePt = dims.insideMargin  * PT
  const outsidePt = dims.outsideMargin * PT
  const topPt    = dims.topMargin     * PT
  const bottomPt = dims.bottomMargin  * PT
  const leftPt   = isRecto ? insidePt : outsidePt
  const rightPt  = isRecto ? outsidePt : insidePt
  const textW    = width - leftPt - rightPt
  const gridPt   = 14.17 // ~5mm in points

  // Horizontal lines
  let y = height - topPt
  while (y >= bottomPt) {
    page.drawLine({
      start: { x: leftPt, y },
      end:   { x: leftPt + textW, y },
      thickness: 0.3, color: rgb(0.82, 0.82, 0.86),
    })
    y -= gridPt
  }
  // Vertical lines
  let x = leftPt
  while (x <= leftPt + textW) {
    page.drawLine({
      start: { x, y: height - topPt },
      end:   { x, y: bottomPt },
      thickness: 0.3, color: rgb(0.82, 0.82, 0.86),
    })
    x += gridPt
  }

  if (opts.hasPageNumbers) {
    const numStr = String(opts.pageNum)
    const numX   = isRecto ? (width - rightPt - 20) : (leftPt + 4)
    page.drawText(numStr, { x: numX, y: 22, size: 8, color: rgb(0.6, 0.6, 0.65) })
  }
}

/** Blank page */
function drawBlank(
  page: PDFPage,
  dims: InteriorDimensions,
  isRecto: boolean,
  opts: { accent: RGB; hasPageNumbers: boolean; pageNum: number },
) {
  if (!opts.hasPageNumbers) return
  const PT = dims.pt
  const { width } = page.getSize()
  const insidePt  = dims.insideMargin  * PT
  const outsidePt = dims.outsideMargin * PT
  const leftPt    = isRecto ? insidePt : outsidePt
  const rightPt   = isRecto ? outsidePt : insidePt
  const numStr    = String(opts.pageNum)
  const numX      = isRecto ? (width - rightPt - 20) : (leftPt + 4)
  page.drawText(numStr, { x: numX, y: 22, size: 8, color: rgb(0.6, 0.6, 0.65) })
}

/** Weekly planner page */
function drawPlannerWeekly(
  page: PDFPage,
  dims: InteriorDimensions,
  fonts: { bold: PDFFont; regular: PDFFont },
  opts: { accent: RGB; pageNum: number; hasPageNumbers: boolean },
  weekNumber: number,
) {
  const PT = dims.pt
  const { width, height } = page.getSize()
  const insidePt  = dims.insideMargin  * PT
  const outsidePt = dims.outsideMargin * PT
  const topPt     = dims.topMargin     * PT
  const bottomPt  = dims.bottomMargin  * PT
  const leftPt    = insidePt  // always same direction for planner (always recto style)
  const textW     = width - insidePt - outsidePt
  const textH     = height - topPt - bottomPt

  const accent = opts.accent

  // Header bar
  page.drawRectangle({
    x: leftPt, y: height - topPt,
    width: textW, height: 22,
    color: accent, opacity: 0.12,
  })
  page.drawText(`WEEK ${weekNumber}`, {
    x: leftPt + 4, y: height - topPt + 5,
    size: 11, font: fonts.bold, color: accent,
  })
  page.drawText('GOALS  ____________________', {
    x: leftPt + textW - 200, y: height - topPt + 5,
    size: 8, font: fonts.regular, color: rgb(0.5, 0.5, 0.55),
  })

  // 7 day columns
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
  const colW  = textW / 7
  const colH  = textH - 24  // leave bottom for notes row

  days.forEach((day, i) => {
    const x = leftPt + i * colW
    const y = bottomPt + 24   // above notes row

    // Day header
    page.drawRectangle({
      x, y: y + colH - 18,
      width: colW - 2, height: 18,
      color: i >= 5 ? accent : rgb(0.12, 0.12, 0.15),
      opacity: i >= 5 ? 0.2 : 0.8,
    })
    page.drawText(day, {
      x: x + colW * 0.5 - 10, y: y + colH - 14,
      size: 8, font: fonts.bold,
      color: i >= 5 ? accent : rgb(0.9, 0.9, 0.9),
    })

    // Column lines
    const lineCount = 12
    const lineSpacing = (colH - 22) / lineCount
    for (let j = 0; j <= lineCount; j++) {
      const lineY = y + colH - 22 - j * lineSpacing
      page.drawLine({
        start: { x, y: lineY },
        end:   { x: x + colW - 2, y: lineY },
        thickness: 0.3, color: rgb(0.82, 0.82, 0.86),
      })
    }

    // Vertical divider between columns
    if (i > 0) {
      page.drawLine({
        start: { x, y: y },
        end:   { x, y: y + colH },
        thickness: 0.4, color: rgb(0.82, 0.82, 0.86),
      })
    }
  })

  // Notes row at bottom
  page.drawText('NOTES', {
    x: leftPt + 4, y: bottomPt + 14,
    size: 7, font: fonts.bold, color: accent,
  })
  page.drawLine({
    start: { x: leftPt + 36, y: bottomPt + 17 },
    end:   { x: leftPt + textW, y: bottomPt + 17 },
    thickness: 0.3, color: rgb(0.82, 0.82, 0.86),
  })
  page.drawLine({
    start: { x: leftPt, y: bottomPt + 17 },
    end:   { x: leftPt + textW, y: bottomPt + 17 },
    thickness: 0.3, color: rgb(0.82, 0.82, 0.86),
  })

  if (opts.hasPageNumbers) {
    page.drawText(String(opts.pageNum), { x: leftPt + textW - 16, y: 22, size: 8, color: rgb(0.6, 0.6, 0.65) })
  }
}

/** Daily planner page */
function drawPlannerDaily(
  page: PDFPage,
  dims: InteriorDimensions,
  fonts: { bold: PDFFont; regular: PDFFont },
  opts: { accent: RGB; pageNum: number; hasPageNumbers: boolean },
) {
  const PT = dims.pt
  const { width, height } = page.getSize()
  const insidePt  = dims.insideMargin  * PT
  const outsidePt = dims.outsideMargin * PT
  const topPt     = dims.topMargin     * PT
  const bottomPt  = dims.bottomMargin  * PT
  const leftPt    = insidePt
  const textW     = width - insidePt - outsidePt
  const textH     = height - topPt - bottomPt
  const accent    = opts.accent

  // Date header line
  page.drawLine({
    start: { x: leftPt, y: height - topPt + 4 },
    end:   { x: leftPt + textW, y: height - topPt + 4 },
    thickness: 1.5, color: accent,
  })
  page.drawText('DATE: _________________', {
    x: leftPt, y: height - topPt + 8,
    size: 9, font: fonts.bold, color: rgb(0.4, 0.4, 0.45),
  })

  // Two-column layout: left = schedule, right = notes/priorities
  const colW = textW * 0.55
  const noteW = textW - colW - 8

  // Schedule column (hours 6am–10pm)
  const hours = Array.from({ length: 17 }, (_, i) => i + 6)  // 6..22
  const rowH  = textH / (hours.length + 1)

  hours.forEach((h, i) => {
    const y = height - topPt - (i + 1) * rowH
    const label = h === 12 ? '12 PM' : h < 12 ? `${h} AM` : `${h - 12} PM`
    page.drawText(label, {
      x: leftPt, y: y + 3,
      size: 7, font: fonts.regular, color: rgb(0.55, 0.55, 0.6),
    })
    page.drawLine({
      start: { x: leftPt + 34, y: y },
      end:   { x: leftPt + colW, y: y },
      thickness: 0.35, color: rgb(0.82, 0.82, 0.86),
    })
    // Half-hour tick
    const halfY = y - rowH * 0.5
    if (halfY > bottomPt) {
      page.drawLine({
        start: { x: leftPt + 34, y: halfY },
        end:   { x: leftPt + colW, y: halfY },
        thickness: 0.2, color: rgb(0.88, 0.88, 0.9),
        opacity: 0.7,
      })
    }
  })

  // Right column sections
  const sections = [
    { label: 'TOP PRIORITIES', lines: 3 },
    { label: 'NOTES', lines: 8 },
    { label: 'GRATITUDE', lines: 3 },
  ]
  let rightY = height - topPt
  const rightX = leftPt + colW + 12
  sections.forEach(sec => {
    const secH = (sec.lines + 1.5) * 14
    page.drawRectangle({
      x: rightX - 4, y: rightY - secH,
      width: noteW + 4, height: secH - 4,
      color: rgb(0.97, 0.97, 1), opacity: 0.06,
    })
    page.drawText(sec.label, {
      x: rightX, y: rightY - 12,
      size: 7, font: fonts.bold, color: accent,
    })
    for (let l = 0; l < sec.lines; l++) {
      const lineY = rightY - 12 - (l + 1) * 14
      page.drawLine({
        start: { x: rightX, y: lineY },
        end:   { x: rightX + noteW - 4, y: lineY },
        thickness: 0.35, color: rgb(0.82, 0.82, 0.86),
      })
    }
    rightY -= secH
  })

  if (opts.hasPageNumbers) {
    page.drawText(String(opts.pageNum), { x: leftPt + textW - 16, y: 22, size: 8, color: rgb(0.6, 0.6, 0.65) })
  }
}

/** Habit tracker page — 1 month of habits */
function drawHabitTracker(
  page: PDFPage,
  dims: InteriorDimensions,
  fonts: { bold: PDFFont; regular: PDFFont },
  opts: { accent: RGB; pageNum: number; hasPageNumbers: boolean },
  habits: string[],
  monthLabel: string,
) {
  const PT = dims.pt
  const { width, height } = page.getSize()
  const insidePt  = dims.insideMargin  * PT
  const outsidePt = dims.outsideMargin * PT
  const topPt     = dims.topMargin     * PT
  const bottomPt  = dims.bottomMargin  * PT
  const leftPt    = insidePt
  const textW     = width - insidePt - outsidePt
  const accent    = opts.accent

  const days       = 31
  const labelColW  = Math.min(textW * 0.35, 120)
  const gridW      = textW - labelColW
  const cellW      = gridW / days
  const rowH       = (height - topPt - bottomPt - 28) / (habits.length + 1)

  // Header
  page.drawText(`HABIT TRACKER — ${monthLabel}`, {
    x: leftPt, y: height - topPt + 6,
    size: 10, font: fonts.bold, color: accent,
  })

  // Day numbers header row
  const headerY = height - topPt - rowH
  for (let d = 1; d <= days; d++) {
    const cx = leftPt + labelColW + (d - 1) * cellW + cellW * 0.5
    page.drawText(String(d), {
      x: cx - (d >= 10 ? 4 : 2), y: headerY + rowH * 0.3,
      size: 6, font: fonts.bold, color: rgb(0.5, 0.5, 0.55),
    })
  }

  // Habit rows
  habits.forEach((habit, i) => {
    const rowY = height - topPt - (i + 2) * rowH

    // Row background (alternating)
    if (i % 2 === 0) {
      page.drawRectangle({
        x: leftPt, y: rowY,
        width: textW, height: rowH,
        color: rgb(0.96, 0.96, 0.98), opacity: 0.07,
      })
    }

    // Habit label
    const shortLabel = habit.length > 20 ? habit.slice(0, 19) + '…' : habit
    page.drawText(shortLabel, {
      x: leftPt + 4, y: rowY + rowH * 0.3,
      size: 7.5, font: fonts.regular, color: rgb(0.25, 0.25, 0.3),
    })

    // Day checkboxes
    for (let d = 0; d < days; d++) {
      const cx = leftPt + labelColW + d * cellW + cellW * 0.5 - 4
      const cy = rowY + rowH * 0.25
      page.drawRectangle({
        x: cx, y: cy,
        width: 7, height: 7,
        borderWidth: 0.4,
        borderColor: rgb(0.78, 0.78, 0.83),
        color: rgb(1, 1, 1),
      })
    }
  })

  // Grid lines
  const gridStartY = height - topPt - rowH
  const gridEndY   = height - topPt - (habits.length + 2) * rowH
  page.drawLine({
    start: { x: leftPt + labelColW, y: gridStartY + rowH },
    end:   { x: leftPt + labelColW, y: gridEndY },
    thickness: 0.5, color: rgb(0.7, 0.7, 0.75),
  })

  if (opts.hasPageNumbers) {
    page.drawText(String(opts.pageNum), { x: leftPt + textW - 16, y: 22, size: 8, color: rgb(0.6, 0.6, 0.65) })
  }
}

/** Recipe page */
function drawRecipe(
  page: PDFPage,
  dims: InteriorDimensions,
  fonts: { bold: PDFFont; regular: PDFFont },
  opts: { accent: RGB; pageNum: number; hasPageNumbers: boolean },
) {
  const PT = dims.pt
  const { width, height } = page.getSize()
  const insidePt  = dims.insideMargin  * PT
  const outsidePt = dims.outsideMargin * PT
  const topPt     = dims.topMargin     * PT
  const bottomPt  = dims.bottomMargin  * PT
  const leftPt    = insidePt
  const textW     = width - insidePt - outsidePt
  const accent    = opts.accent

  let curY = height - topPt

  // Recipe name field
  page.drawText('Recipe Name:', { x: leftPt, y: curY + 2, size: 8, font: fonts.bold, color: accent })
  curY -= 20
  page.drawLine({ start: { x: leftPt, y: curY }, end: { x: leftPt + textW, y: curY }, thickness: 1, color: rgb(0.72, 0.72, 0.76) })
  curY -= 16

  // Meta row (prep, cook, serves)
  const metaW = textW / 3
  ;['Prep Time', 'Cook Time', 'Serves'].forEach((label, i) => {
    const x = leftPt + i * metaW
    page.drawText(label + ':', { x, y: curY, size: 7.5, font: fonts.bold, color: rgb(0.45, 0.45, 0.5) })
    page.drawLine({
      start: { x, y: curY - 12 },
      end:   { x: x + metaW - 8, y: curY - 12 },
      thickness: 0.5, color: rgb(0.82, 0.82, 0.86),
    })
  })
  curY -= 28

  // Divider
  page.drawLine({ start: { x: leftPt, y: curY }, end: { x: leftPt + textW, y: curY }, thickness: 0.5, color: accent, opacity: 0.4 })
  curY -= 10

  // Two columns: ingredients (40%) + instructions (60%)
  const ingW   = textW * 0.38
  const instW  = textW - ingW - 10
  const sectionH = curY - bottomPt

  // Ingredients
  page.drawText('INGREDIENTS', { x: leftPt, y: curY - 2, size: 8, font: fonts.bold, color: accent })
  const ingLines = Math.floor((sectionH - 18) / 16)
  for (let l = 0; l < ingLines; l++) {
    const lineY = curY - 18 - l * 16
    // Bullet
    page.drawCircle({ x: leftPt + 4, y: lineY + 4, size: 2, color: rgb(0.72, 0.72, 0.76) })
    page.drawLine({
      start: { x: leftPt + 10, y: lineY },
      end:   { x: leftPt + ingW, y: lineY },
      thickness: 0.35, color: rgb(0.82, 0.82, 0.86),
    })
  }

  // Instructions
  const instX = leftPt + ingW + 10
  page.drawText('INSTRUCTIONS', { x: instX, y: curY - 2, size: 8, font: fonts.bold, color: accent })
  const instLines = Math.floor((sectionH - 18) / 20)
  for (let l = 0; l < instLines; l++) {
    const lineY = curY - 18 - l * 20
    page.drawText(String(l + 1) + '.', { x: instX, y: lineY + 3, size: 7.5, font: fonts.bold, color: rgb(0.6, 0.6, 0.65) })
    page.drawLine({
      start: { x: instX + 14, y: lineY },
      end:   { x: instX + instW, y: lineY },
      thickness: 0.35, color: rgb(0.82, 0.82, 0.86),
    })
  }

  // Vertical divider between columns
  page.drawLine({
    start: { x: leftPt + ingW + 5, y: curY },
    end:   { x: leftPt + ingW + 5, y: bottomPt },
    thickness: 0.4, color: rgb(0.82, 0.82, 0.86),
  })

  if (opts.hasPageNumbers) {
    page.drawText(String(opts.pageNum), { x: leftPt + textW - 16, y: 22, size: 8, color: rgb(0.6, 0.6, 0.65) })
  }
}

// ── Watermark ───────────────────────────────────────────────────────────────

function drawWatermark(page: PDFPage, boldFont: PDFFont) {
  const { width, height } = page.getSize()
  const text = 'KDP COVER AI - FREE PLAN'
  const size = 24
  page.drawText(text, {
    x: width * 0.15, y: height * 0.45,
    size, font: boldFont,
    color: rgb(0, 0, 0), opacity: 0.07,
    rotate: degrees(35),
  })
}

// ── Main generator ──────────────────────────────────────────────────────────

export async function generateInteriorPdf(
  input: InteriorInput,
  isFreePlan: boolean,
): Promise<InteriorResult> {
  const dims = calculateInteriorDimensions(input.trimSize, input.pageCount)
  const PT   = dims.pt

  const pdfDoc = await PDFDocument.create()
  pdfDoc.setTitle(input.title ?? 'KDP Interior')
  pdfDoc.setCreator('KDP Cover AI')

  const boldFont    = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const pageWidthPt  = dims.trimWidth  * PT
  const pageHeightPt = dims.trimHeight * PT
  const accent       = accentColor(input.primaryColor)
  const spacing      = lineSpacingPt(input.lineSpacing)
  const hasHeader    = input.hasHeader    ?? false
  const hasPageNums  = input.hasPageNumbers ?? true

  // Parse custom data
  let habits: string[] = ['Habit 1', 'Habit 2', 'Habit 3', 'Habit 4', 'Habit 5']
  if (input.template === 'habit-tracker' && input.customData) {
    try {
      const cfg: HabitTrackerConfig = JSON.parse(input.customData)
      if (Array.isArray(cfg.habits) && cfg.habits.length > 0) {
        habits = cfg.habits.slice(0, 10)
      }
    } catch { /* use defaults */ }
  }

  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December']

  for (let i = 0; i < input.pageCount; i++) {
    const page     = pdfDoc.addPage([pageWidthPt, pageHeightPt])
    const isRecto  = i % 2 === 0   // page 0 = recto (right-hand page 1)
    const pageNum  = i + 1
    const baseOpts = { accent, hasPageNumbers: hasPageNums, pageNum }

    switch (input.template) {
      case 'lined':
        drawLined(page, dims, isRecto, { ...baseOpts, spacing, headerText: input.headerText, hasHeader })
        break

      case 'dotted':
        drawDotted(page, dims, isRecto, { ...baseOpts, spacing })
        break

      case 'graph':
        drawGraph(page, dims, isRecto, baseOpts)
        break

      case 'blank':
        drawBlank(page, dims, isRecto, baseOpts)
        break

      case 'planner-weekly':
        drawPlannerWeekly(page, dims, { bold: boldFont, regular: regularFont }, baseOpts, Math.ceil(pageNum / 2))
        break

      case 'planner-daily':
        drawPlannerDaily(page, dims, { bold: boldFont, regular: regularFont }, baseOpts)
        break

      case 'habit-tracker': {
        const monthIndex = Math.floor(i / 2) % 12
        drawHabitTracker(page, dims, { bold: boldFont, regular: regularFont }, baseOpts, habits, months[monthIndex])
        break
      }

      case 'recipe':
        drawRecipe(page, dims, { bold: boldFont, regular: regularFont }, baseOpts)
        break
    }

    if (isFreePlan && i % 4 === 0) {
      drawWatermark(page, boldFont)
    }
  }

  const pdfBytes  = await pdfDoc.save()
  const pdfBuffer = Buffer.from(pdfBytes)

  return {
    pdfBuffer,
    fileSizeBytes: pdfBuffer.length,
    pageCount: input.pageCount,
  }
}
