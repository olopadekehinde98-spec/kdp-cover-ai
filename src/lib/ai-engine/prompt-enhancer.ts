import type { Genre, GenerationInput } from './types'

const GENRE_STYLES: Record<Genre, string> = {
  'thriller':          'cinematic dark atmosphere, dramatic shadows, high contrast, suspenseful composition, film noir lighting, deep shadows and highlights',
  'romance':           'soft warm lighting, dreamy bokeh, intimate atmosphere, pastel or rich jewel tones, elegant composition, emotional warmth',
  'fantasy':           'epic magical atmosphere, ethereal lighting, mystical elements, rich saturated colors, detailed world-building, dramatic sky',
  'sci-fi':            'futuristic aesthetic, cool blue and purple tones, neon accents, technological elements, vast cosmic scale, sleek design',
  'mystery':           'moody foggy atmosphere, muted colors with single accent, shadows and silhouettes, noir style, enigmatic composition',
  'horror':            'dark oppressive atmosphere, deep shadows, desaturated colors with red accents, unsettling composition, dread-inducing imagery',
  'business':          'clean professional design, bold geometric shapes, confident color palette, modern minimalist style, authoritative layout',
  'self-help':         'uplifting bright composition, warm inspiring colors, clean modern aesthetic, motivational energy, positive visual metaphors',
  'memoir':            'intimate personal aesthetic, warm vintage tones, emotional depth, authentic storytelling atmosphere, nostalgic quality',
  'christian':         'peaceful serene atmosphere, light rays and divine light, warm golden tones, inspirational imagery, spiritual symbolism',
  'children':          'bright cheerful colors, playful whimsical elements, friendly characters, clean bold shapes, joyful energetic composition',
  'literary-fiction':  'artistic sophisticated composition, muted literary palette, symbolic imagery, painterly quality, thoughtful minimalism',
  'young-adult':       'dynamic energetic composition, bold colors, relatable protagonist, contemporary feel, emotional intensity',
  'historical-fiction':'period-accurate historical aesthetic, rich earthy tones, textured vintage quality, authentic historical atmosphere',
  'biography':         'dignified portrait composition, timeless aesthetic, warm authoritative tones, historical weight, classic design sensibility',
}

const GENRE_LIGHTING: Record<Genre, string> = {
  'thriller':          'dramatic chiaroscuro lighting, rim lighting, dark vignette',
  'romance':           'soft golden hour light, diffused warm glow, romantic sunset',
  'fantasy':           'magical bioluminescent light, aurora-like glow, mystical illumination',
  'sci-fi':            'cool blue neon lighting, holographic glow, starlight',
  'mystery':           'single harsh spotlight, fog-diffused light, deep shadows',
  'horror':            'flickering harsh light, red-tinted shadows, moonlight',
  'business':          'clean studio lighting, professional even illumination',
  'self-help':         'bright optimistic sunlight, lens flare, warm glow',
  'memoir':            'natural warm daylight, golden nostalgic tones',
  'christian':         'divine rays of light, heavenly golden illumination',
  'children':          'bright even cheerful lighting, colorful and fun',
  'literary-fiction':  'overcast soft light, painterly diffused illumination',
  'young-adult':       'dramatic dynamic lighting, vibrant energy',
  'historical-fiction':'candlelight, period lanterns, aged warm tones',
  'biography':         'dignified portrait lighting, three-point setup',
}

export function enhancePrompt(input: GenerationInput, targetAspectRatio: '1:1' | '2:3' | '3:1' | 'full-wrap'): string {
  const genreStyle = GENRE_STYLES[input.genre]
  const genreLight = GENRE_LIGHTING[input.genre]

  const dimensionInstruction = targetAspectRatio === 'full-wrap'
    ? 'ultra-wide panoramic composition designed for a full book wrap cover (front cover, spine, and back cover as one seamless image), left third is back cover, center strip is spine, right two-thirds is front cover'
    : 'vertical book cover composition, portrait orientation'

  return [
    input.userPrompt,
    genreStyle,
    genreLight,
    dimensionInstruction,
    'professional book cover quality, high resolution, publishing industry standard',
    'no text, no words, no letters, no title, no typography — pure artwork only',
    'seamless continuous background suitable for full-wrap cover printing',
    '300 DPI print quality, vibrant colors, sharp details',
  ].filter(Boolean).join(', ')
}

export function buildNegativePrompt(): string {
  return [
    'text, words, letters, title, watermark, signature',
    'blurry, low quality, pixelated, noisy',
    'cut off, cropped, incomplete',
    'amateur, amateurish, poor quality',
    'oversaturated, washed out',
  ].join(', ')
}
