'use client'
import { useEffect, useRef } from 'react'

export interface KDPDims {
  totalWidth: number; totalHeight: number
  totalWidthPx: number; totalHeightPx: number
  spineWidth: number; trimWidth: number
  bleed: number; safeZone: number; ppi: number
  frontCoverStartX: number; spineStartX: number; backCoverStartX: number
}

export interface CoverPreviewProps {
  imageUrl: string
  dims: KDPDims
  title: string
  subtitle?: string
  authorName: string
  description?: string
  authorBio?: string
  reviewQuote?: string
  reviewAttribution?: string
  titleFontScale?: number
  titleStyle?: string
}

// Maps the titleStyle keys to Canvas CSS fonts (closest available system fonts)
const FONT_MAP: Record<string, string> = {
  'bold-sans':    'bold Arial, Helvetica, sans-serif',
  'serif':        'bold "Times New Roman", Georgia, serif',
  'serif-italic': 'bold italic "Times New Roman", Georgia, serif',
  'serif-light':  'italic "Times New Roman", Georgia, serif',
  'sans-oblique': 'bold italic Arial, Helvetica, sans-serif',
  'courier-bold': 'bold "Courier New", Courier, monospace',
}

// Mirrors renderer.ts scaleFontSize() — shrinks long titles
function scaleFont(textLen: number, basePx: number): number {
  if (textLen <= 12) return basePx
  if (textLen <= 20) return Math.round(basePx * 0.88)
  if (textLen <= 30) return Math.round(basePx * 0.75)
  return Math.round(basePx * 0.62)
}

// Word-wrap helper — splits text into lines fitting within maxW canvas pixels
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w
    if (cur && ctx.measureText(test).width > maxW) { lines.push(cur); cur = w }
    else cur = test
  }
  if (cur) lines.push(cur)
  return lines
}

export default function CoverPreview(props: CoverPreviewProps) {
  const {
    imageUrl, dims, title, subtitle, authorName,
    description, authorBio, reviewQuote, reviewAttribution,
    titleFontScale = 1.0, titleStyle = 'bold-sans',
  } = props

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !imageUrl) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Render at 900 px wide (retina-friendly: CSS width 100%, logical 900 px)
    const PREVIEW_W = 900
    const scale = PREVIEW_W / dims.totalWidthPx
    canvas.width  = PREVIEW_W
    canvas.height = Math.round(dims.totalHeightPx * scale)

    const ppi = dims.ppi
    // Helper: scale a full-resolution pixel value to canvas pixels
    const sp  = (fullResPx: number) => Math.round(fullResPx * scale)

    // ── Pixel positions (canvas coords) ─────────────────────────
    const bleedPx = sp(dims.bleed    * ppi)   // ~9 px at 900 wide
    const safePx  = sp(dims.safeZone * ppi)   // ~18 px
    const padPx   = safePx + sp(0.20 * ppi)   // content padding from trim edge

    const frontX  = sp(dims.frontCoverStartX * ppi)
    const frontW  = sp(dims.trimWidth        * ppi)
    const backX   = sp(dims.backCoverStartX  * ppi)
    const backW   = sp(dims.trimWidth        * ppi)
    const spineX  = sp(dims.spineStartX      * ppi)
    const spineW  = sp(dims.spineWidth       * ppi)
    const H       = canvas.height
    const contentH = H - bleedPx * 2

    const frontTextW = frontW - padPx * 2
    const backTextW  = backW  - padPx * 2
    const backCX     = backX  + padPx   // back cover text left edge

    // ── Font sizes (mirror renderer.ts) ─────────────────────────
    const titleFontBase = Math.round(dims.ppi * 1.3 * scale)
    const titleFontSz   = Math.round(scaleFont(title.length, titleFontBase) * titleFontScale)
    const subFontSz     = Math.round(titleFontSz * 0.32)
    const authorFontSz  = sp(dims.ppi * 0.32)

    // Y positions (canvas top-down, matching renderer.ts pixel coords × scale)
    const titleTopY  = bleedPx + safePx + sp(0.50 * ppi)
    const authorTopY = H - bleedPx - safePx - authorFontSz - sp(0.35 * ppi)

    const titleFont = FONT_MAP[titleStyle] ?? FONT_MAP['bold-sans']

    const img = new Image()
    img.onload = () => {
      // ── 1. Background image ────────────────────────────────────
      ctx.drawImage(img, 0, 0, canvas.width, H)

      // ── 2. Back cover overlay ──────────────────────────────────
      ctx.fillStyle = 'rgba(0,0,0,0.62)'
      ctx.fillRect(backX, bleedPx, backW, contentH)

      // ── 3. Spine overlay ───────────────────────────────────────
      if (dims.spineWidth >= 0.15) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)'
        ctx.fillRect(spineX, bleedPx, spineW, contentH)
      }

      // ── 4. Title ───────────────────────────────────────────────
      ctx.font = `${titleFontSz}px ${titleFont}`
      const titleText  = title.toUpperCase()
      const titleLines = wrapText(ctx, titleText, frontTextW)
      const lineH      = titleFontSz * 1.15
      const titleBlockH = titleFontSz + (titleLines.length - 1) * lineH

      // Dark overlay behind title block
      ctx.fillStyle = 'rgba(0,0,0,0.52)'
      ctx.fillRect(frontX, titleTopY - sp(0.12 * ppi), frontW, titleBlockH + sp(0.50 * ppi))

      // Title text lines
      ctx.fillStyle = '#FFFFFF'
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'top'
      const frontCX = frontX + frontW / 2
      titleLines.forEach((line, i) => {
        ctx.fillText(line, frontCX, titleTopY + i * lineH)
      })

      // ── 5. Subtitle ────────────────────────────────────────────
      if (subtitle && subtitle.trim()) {
        const subY = titleTopY + titleBlockH + sp(0.20 * ppi)
        ctx.font = `italic ${subFontSz}px Arial, sans-serif`
        ctx.fillStyle = 'rgba(220,220,220,0.95)'
        ctx.fillText(subtitle, frontCX, subY)
      }

      // ── 6. Author strip ────────────────────────────────────────
      const stripTop = authorTopY - sp(0.18 * ppi)
      const stripH   = authorFontSz + sp(0.58 * ppi)
      ctx.fillStyle = 'rgba(0,0,0,0.62)'
      ctx.fillRect(frontX, stripTop, frontW, stripH)

      // Gold divider line above author name
      const goldY = authorTopY - sp(0.08 * ppi)
      ctx.strokeStyle = 'rgb(217,184,90)'
      ctx.lineWidth   = Math.max(1, scale * 1.8)
      ctx.beginPath()
      ctx.moveTo(frontCX - frontW * 0.28, goldY)
      ctx.lineTo(frontCX + frontW * 0.28, goldY)
      ctx.stroke()

      // Author name
      ctx.font = `bold ${authorFontSz}px Arial, Helvetica, sans-serif`
      ctx.fillStyle    = '#FFFFFF'
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(authorName.toUpperCase(), frontCX, authorTopY)

      // ── 7. Spine text (only when wide enough) ──────────────────
      if (dims.spineWidth >= 0.18 && spineW >= 18) {
        const spineCX    = spineX + spineW / 2
        const spineTitleSz = Math.min(Math.round(spineW * 0.58), 20)
        const spineAuthSz  = Math.min(Math.round(spineW * 0.42), 14)
        if (spineTitleSz >= 6) {
          ctx.save()
          ctx.translate(spineCX, H / 2)
          ctx.rotate(-Math.PI / 2)

          ctx.fillStyle    = '#FFFFFF'
          ctx.font         = `bold ${spineTitleSz}px Arial, sans-serif`
          ctx.textAlign    = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(title.toUpperCase().substring(0, 35), 0, spineTitleSz * 0.55)

          ctx.fillStyle = 'rgb(217,184,90)'
          ctx.font      = `bold ${spineAuthSz}px Arial, sans-serif`
          ctx.fillText(authorName.toUpperCase().substring(0, 30), 0, -spineTitleSz * 0.80)

          ctx.restore()
        }
      }

      // ── 8. Back cover text ─────────────────────────────────────
      let by = bleedPx + safePx + sp(0.38 * ppi)

      if (description && description.trim()) {
        const labelSz = Math.max(10, Math.round(authorFontSz * 0.54))
        const descSz  = Math.max(9,  Math.round(authorFontSz * 0.46))
        const descLH  = descSz * 1.68

        ctx.fillStyle    = 'rgb(217,184,90)'
        ctx.font         = `bold ${labelSz}px Arial, sans-serif`
        ctx.textAlign    = 'left'
        ctx.textBaseline = 'top'
        ctx.fillText('ABOUT THE BOOK', backCX, by)
        by += labelSz + 2

        // Underline beneath label
        ctx.strokeStyle = 'rgb(217,184,90)'
        ctx.lineWidth   = 0.8
        ctx.beginPath()
        ctx.moveTo(backCX, by)
        ctx.lineTo(backCX + backTextW * 0.46, by)
        ctx.stroke()
        by += 5

        ctx.fillStyle = 'rgba(242,242,242,0.92)'
        ctx.font      = `${descSz}px Arial, sans-serif`
        const descLines = wrapText(ctx, description, backTextW).slice(0, 14)
        descLines.forEach(line => { ctx.fillText(line, backCX, by); by += descLH })
        by += 4
      }

      if (reviewQuote && reviewQuote.trim()) {
        const quoteSz  = Math.max(9, Math.round(authorFontSz * 0.44))
        const quoteLH  = quoteSz * 1.60

        // Separator
        ctx.strokeStyle = 'rgba(217,184,90,0.35)'
        ctx.lineWidth   = 0.8
        ctx.beginPath(); ctx.moveTo(backCX, by); ctx.lineTo(backCX + backTextW, by); ctx.stroke()
        by += 5

        ctx.fillStyle    = 'rgb(217,184,90)'
        ctx.font         = `italic ${quoteSz}px "Times New Roman", Georgia, serif`
        ctx.textAlign    = 'left'
        ctx.textBaseline = 'top'
        wrapText(ctx, `"${reviewQuote}"`, backTextW).slice(0, 3).forEach(l => {
          ctx.fillText(l, backCX, by); by += quoteLH
        })

        if (reviewAttribution) {
          const attrSz = Math.max(8, Math.round(quoteSz * 0.84))
          ctx.fillStyle = 'rgba(160,160,160,0.90)'
          ctx.font      = `${attrSz}px Arial, sans-serif`
          ctx.fillText(reviewAttribution, backCX, by); by += attrSz * 1.5
        }
        by += 4
      }

      if (authorBio && authorBio.trim()) {
        const bioLabelSz = Math.max(9, Math.round(authorFontSz * 0.46))
        const bioSz      = Math.max(9, Math.round(authorFontSz * 0.44))
        const bioLH      = bioSz * 1.68

        ctx.strokeStyle = 'rgba(217,184,90,0.35)'
        ctx.lineWidth   = 0.8
        ctx.beginPath(); ctx.moveTo(backCX, by); ctx.lineTo(backCX + backTextW, by); ctx.stroke()
        by += 5

        ctx.fillStyle    = 'rgb(217,184,90)'
        ctx.font         = `bold ${bioLabelSz}px Arial, sans-serif`
        ctx.textAlign    = 'left'
        ctx.textBaseline = 'top'
        ctx.fillText('ABOUT THE AUTHOR', backCX, by); by += bioLabelSz + 4

        ctx.fillStyle = 'rgba(224,224,224,0.88)'
        ctx.font      = `italic ${bioSz}px Arial, sans-serif`
        wrapText(ctx, authorBio, backTextW).slice(0, 5).forEach(l => {
          ctx.fillText(l, backCX, by); by += bioLH
        })
      }

      // ── 9. Barcode placeholder (bottom-right of back cover) ────
      const bcW = sp(2.0 * ppi)
      const bcH = sp(1.2 * ppi)
      const bcL = backX + backW - bcW - safePx
      const bcT = H - bleedPx - bcH - safePx
      ctx.fillStyle = 'rgba(255,255,255,0.95)'
      ctx.fillRect(bcL, bcT, bcW, bcH)
      const barcodeFontSz = Math.max(8, sp(0.10 * ppi))
      ctx.fillStyle    = 'rgba(80,80,80,0.70)'
      ctx.font         = `bold ${barcodeFontSz}px Arial, sans-serif`
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('ISBN BARCODE', bcL + bcW / 2, bcT + bcH / 2)

      // ── 10. Layout guide overlays ──────────────────────────────
      ctx.setLineDash([3, 5])
      ctx.lineWidth = 1

      // Bleed edge lines (red)
      ctx.strokeStyle = 'rgba(255,80,80,0.38)'
      ;[
        [0, bleedPx, canvas.width, bleedPx],
        [0, H - bleedPx, canvas.width, H - bleedPx],
        [bleedPx, 0, bleedPx, H],
        [canvas.width - bleedPx, 0, canvas.width - bleedPx, H],
      ].forEach(([x1,y1,x2,y2]) => {
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
      })

      // Section dividers (white, subtle)
      ctx.strokeStyle = 'rgba(255,255,255,0.18)'
      ;[
        [spineX, bleedPx, spineX, H - bleedPx],
        [frontX, bleedPx, frontX, H - bleedPx],
      ].forEach(([x1,y1,x2,y2]) => {
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
      })
      ctx.setLineDash([])

      // Section labels
      const labelFontSz = Math.max(8, sp(0.09 * ppi))
      ctx.fillStyle    = 'rgba(255,255,255,0.28)'
      ctx.font         = `bold ${labelFontSz}px Arial, sans-serif`
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText('← BACK', backX + backW / 2,  bleedPx + 3)
      ctx.fillText('FRONT →', frontX + frontW / 2, bleedPx + 3)
      if (spineW >= 22) {
        ctx.save()
        ctx.translate(spineX + spineW / 2, H / 2)
        ctx.rotate(-Math.PI / 2)
        ctx.font = `bold ${Math.max(7, sp(0.07 * ppi))}px Arial, sans-serif`
        ctx.fillStyle = 'rgba(255,255,255,0.25)'
        ctx.textAlign = 'center'
        ctx.fillText('SPINE', 0, 0)
        ctx.restore()
      }
    }

    img.src = imageUrl
  }, [
    imageUrl, dims, title, subtitle, authorName,
    description, authorBio, reviewQuote, reviewAttribution,
    titleFontScale, titleStyle,
  ])

  return (
    <div className="w-full rounded-xl overflow-hidden border border-gray-700 shadow-2xl bg-gray-900">
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        aria-label="KDP cover preview"
      />
    </div>
  )
}
