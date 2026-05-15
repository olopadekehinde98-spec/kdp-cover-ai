export type Genre =
  | 'thriller' | 'romance' | 'fantasy' | 'sci-fi'
  | 'mystery' | 'horror' | 'business' | 'self-help'
  | 'memoir' | 'christian' | 'children' | 'literary-fiction'
  | 'young-adult' | 'historical-fiction' | 'biography'

export interface GenerationInput {
  title: string
  subtitle?: string
  authorName: string
  genre: Genre
  userPrompt: string
  mood?: string
  colorPalette?: string
  referenceStyle?: string
}

export interface GenerationResult {
  imageUrl: string
  revisedPrompt: string
  width: number
  height: number
  provider: string
}

export interface GenerationJob {
  id: string
  status: 'pending' | 'generating' | 'completed' | 'failed'
  input: GenerationInput
  result?: GenerationResult
  error?: string
  createdAt: Date
}
