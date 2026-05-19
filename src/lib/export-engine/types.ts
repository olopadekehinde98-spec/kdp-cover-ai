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
  titleFontScale?: number   // 0.6 – 1.4, default 1.0
  titleStyle?: 'bold-sans' | 'serif' | 'serif-italic'
  isbn?: string             // e.g. "978-0-00-000000-0"
  barcodeImageBase64?: string  // data:image/png;base64,... or jpeg
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
