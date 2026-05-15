export type PaperType = 'black_and_white' | 'color' | 'premium_color'
export type CoverType = 'paperback' | 'hardcover'
export type TrimSize =
  | '5x8' | '5.06x7.81' | '5.25x8' | '5.5x8.5' | '6x9'
  | '6.14x9.21' | '6.69x9.61' | '7x10' | '7.44x9.69' | '7.5x9.25'
  | '8x10' | '8.5x11'

export interface KDPInput {
  trimSize: TrimSize
  pageCount: number
  paperType: PaperType
  coverType: CoverType
}

export interface KDPDimensions {
  trimWidth: number
  trimHeight: number
  spineWidth: number
  bleed: number
  totalWidth: number
  totalHeight: number
  safeZone: number
  barcodeWidth: number
  barcodeHeight: number
  barcodeX: number
  barcodeY: number
  frontCoverStartX: number
  spineStartX: number
  backCoverStartX: number
  ppi: number
  totalWidthPx: number
  totalHeightPx: number
}

export interface KDPValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}
