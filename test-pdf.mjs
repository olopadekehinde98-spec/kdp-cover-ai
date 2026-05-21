/**
 * Local test: run pdf-generator with synthetic data to catch WinAnsi / embed errors.
 * Run with:  node test-pdf.mjs
 */
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// We need ts-node or compiled JS — easiest: use the compiled Next.js build.
// Instead, let's test the pure logic by importing via tsx:
// Run: npx tsx test-pdf.mjs

// ── Dynamic import after tsx transforms ──────────────────────────────────────
const { generateKDPPdf, validateExport } = await import('./src/lib/export-engine/pdf-generator.ts')
const { calculateKDPDimensions }         = await import('./src/lib/kdp-engine/calculator.ts')
const { buildTypographyLayout }          = await import('./src/lib/typography-engine/renderer.ts')
const { buildBackCoverLayout }           = await import('./src/lib/back-cover-engine/index.ts')

// ── Inline minimal JPEG (1×1 white pixel) — no network needed ────────────────
const imageUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJQAB/9k='
console.log('✓ Using inline 1×1 JPEG test image')

// ── Build real dimensions + layouts ──────────────────────────────────────────
const dims = calculateKDPDimensions({
  trimSize: '6x9',
  pageCount: 300,
  paperType: 'black_and_white',
  coverType: 'paperback',
})

console.log(`Dims: ${dims.totalWidth.toFixed(3)}" × ${dims.totalHeight.toFixed(3)}" @ ${dims.ppi} DPI`)
console.log(`Spine: ${dims.spineWidth.toFixed(4)}"`)

const typography = buildTypographyLayout({
  title: 'THE LAST EMBER',
  subtitle: 'A Story of Survival',
  authorName: 'Samuel Adekehinde',
  genre: 'thriller',
  dims,
})

const backCover = buildBackCoverLayout({
  description: 'In the dying city of Northgate,\none man must choose between\nsurvival and sacrifice.\n\nA gripping thriller that will keep you up all night.',
  authorBio: 'Samuel Adekehinde is a bestselling author\nof thrillers and suspense novels.\nHe lives in Lagos, Nigeria.',
  genre: 'thriller',
  dims,
})

const exportInput = {
  imageUrl,
  dims,
  typography,
  backCover,
  title: 'THE LAST EMBER',
  subtitle: 'A Story of Survival',
  authorName: 'Samuel Adekehinde',
  description: 'In the dying city of Northgate,\none man must choose between survival and sacrifice.\n\nA gripping thriller that will keep you up all night.',
  authorBio: 'Samuel Adekehinde is a bestselling author\nof thrillers and suspense novels.\nHe lives in Lagos, Nigeria.',
}

// ── Validate ──────────────────────────────────────────────────────────────────
const validation = validateExport(exportInput)
if (!validation.valid) {
  console.error('✗ Validation errors:', validation.errors)
  process.exit(1)
}
console.log(`✓ Validation passed (${validation.widthIn.toFixed(3)}" × ${validation.heightIn.toFixed(3)}")`)

// ── Generate PDF ──────────────────────────────────────────────────────────────
console.log('Generating PDF…')
const result = await generateKDPPdf(exportInput)
console.log(`✓ PDF generated (${result.fileSizeBytes} bytes)`)

const outPath = join(dirname(fileURLToPath(import.meta.url)), 'test-output.pdf')
writeFileSync(outPath, result.pdfBuffer)
console.log(`✓ Saved to: ${outPath}`)
console.log('\n✅ ALL TESTS PASSED — no WinAnsi errors, PDF exported successfully.')
