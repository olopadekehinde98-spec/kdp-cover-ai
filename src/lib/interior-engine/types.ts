// ── KDP Interior Engine — shared types ─────────────────────────────────────

export type InteriorTemplate =
  | 'lined'
  | 'dotted'
  | 'blank'
  | 'graph'
  | 'planner-weekly'
  | 'planner-daily'
  | 'habit-tracker'
  | 'recipe'

export type LineSpacing = 'narrow' | 'medium' | 'wide'

export type PaperType = 'black_and_white' | 'color'

export interface InteriorInput {
  title?: string
  template: InteriorTemplate
  trimSize: string           // '6x9', '5x8', '5.5x8.5', '8.5x11'
  pageCount: number          // 24 – 800
  paperType: PaperType
  lineSpacing?: LineSpacing
  hasHeader?: boolean
  hasPageNumbers?: boolean
  headerText?: string
  primaryColor?: string      // hex e.g. '#7c3aed'
  customData?: string        // JSON string for template-specific config
}

export interface InteriorDimensions {
  trimWidth: number      // inches
  trimHeight: number     // inches
  insideMargin: number   // inches (gutter — bigger for thick books)
  outsideMargin: number  // inches
  topMargin: number      // inches
  bottomMargin: number   // inches
  /** Width of the live text area (trimWidth - inside - outside) */
  textWidth: number
  /** Height of the live text area (trimHeight - top - bottom) */
  textHeight: number
  /** Points per inch = 72 */
  pt: 72
}

export interface InteriorResult {
  pdfBuffer: Buffer
  fileSizeBytes: number
  pageCount: number
}

/** Parsed from Interior.customData JSON */
export interface HabitTrackerConfig {
  habits: string[]   // up to 10 habit names
}

export interface PlannerDailyConfig {
  startHour: number  // 5 | 6 | 7
  endHour: number    // 21 | 22 | 23
}
