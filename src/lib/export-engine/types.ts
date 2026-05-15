export interface ExportInput {
  imageUrl: string
  dims: import('@/lib/kdp-engine/types').KDPDimensions
  typography: import('@/lib/typography-engine/types').TypographyLayout
  backCover: import('@/lib/back-cover-engine').BackCoverLayout
  title: string
  subtitle?: string
  authorName: string
  description: string
  authorBio?: string
  reviewQuote?: string
}

export interface ExportResult {
  pdfBuffer: Buffer
  pngPreviewBuffer: Buffer
  widthPx: number
  heightPx: number
  fileSizeBytes: number
}

export interface ExportValidation {
  valid: boolean
  errors: string[]
  widthIn: number
  heightIn: number
  dpi: number
}
