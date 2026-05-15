import type { Genre } from '@/lib/ai-engine/types'

export interface TypographyConfig {
  titleFont: string
  authorFont: string
  subtitleFont: string
  titleSize: number       // in points
  subtitleSize: number
  authorSize: number
  titleColor: string      // hex
  subtitleColor: string
  authorColor: string
  titleWeight: string
  letterSpacing: number   // em units
  lineHeight: number
}

export interface TextPlacement {
  text: string
  x: number        // pixels from left of full-wrap canvas
  y: number        // pixels from top
  width: number    // max width for wrapping
  fontSize: number
  fontFamily: string
  fontWeight: string
  color: string
  letterSpacing: number
  lineHeight: number
  align: 'left' | 'center' | 'right'
  rotation?: number  // for spine text
}

export interface TypographyLayout {
  title: TextPlacement
  subtitle?: TextPlacement
  author: TextPlacement
  spineTitle?: TextPlacement
  spineAuthor?: TextPlacement
}

export interface GenreTypography {
  titleFont: string
  authorFont: string
  titleWeight: string
  titleCase: 'uppercase' | 'capitalize' | 'none'
  letterSpacing: number
  titleColor: string
  authorColor: string
  subtitleColor: string
}
