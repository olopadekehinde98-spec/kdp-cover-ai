import type { KDPInput, KDPDimensions, KDPValidationResult } from './types'

export function validateKDPInput(input: KDPInput): KDPValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (input.pageCount < 24) {
    errors.push('Minimum page count for KDP paperback is 24 pages.')
  }
  if (input.pageCount > 828 && input.coverType === 'paperback') {
    errors.push('Maximum page count for KDP paperback is 828 pages.')
  }
  if (input.pageCount > 550 && input.coverType === 'hardcover') {
    errors.push('Maximum page count for KDP hardcover is 550 pages.')
  }

  const spineMinPages = 79
  if (input.pageCount < spineMinPages) {
    warnings.push(`Books under ${spineMinPages} pages may have a spine too narrow for text. Spine text will be omitted.`)
  }

  return { valid: errors.length === 0, errors, warnings }
}

export function validateExportDimensions(dims: KDPDimensions): KDPValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (dims.totalWidthPx < 100 || dims.totalHeightPx < 100) {
    errors.push('Calculated pixel dimensions are too small. Check page count and trim size.')
  }
  if (dims.spineWidth < 0.0625) {
    errors.push('Spine width is below Amazon minimum (0.0625"). Increase page count.')
  }
  if (dims.ppi < 300) {
    errors.push('Resolution must be at least 300 DPI for KDP print.')
  }
  if (dims.bleed !== 0.125) {
    errors.push('Bleed must be exactly 0.125" on all sides per KDP requirements.')
  }

  return { valid: errors.length === 0, errors, warnings }
}
