import type { GenerationInput, GenerationResult } from './types'
import { enhancePrompt } from './prompt-enhancer'

const OPENAI_SIZES = ['1024x1024', '1792x1024', '1024x1792'] as const

export async function generateCoverImage(
  input: GenerationInput,
  mode: 'full-wrap' | 'front-only' = 'full-wrap'
): Promise<GenerationResult> {
  const enhancedPrompt = enhancePrompt(input, mode === 'full-wrap' ? 'full-wrap' : '2:3')

  // Use Ideogram for best typography-aware generation, fallback to OpenAI
  const provider = process.env.IDEOGRAM_API_KEY ? 'ideogram' : 'openai'

  if (provider === 'ideogram') {
    return generateWithIdeogram(enhancedPrompt, mode)
  }
  return generateWithOpenAI(enhancedPrompt, mode)
}

async function generateWithOpenAI(prompt: string, mode: string): Promise<GenerationResult> {
  const { default: OpenAI } = await import('openai')
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  // Full wrap needs wide; front-only needs portrait
  const size = mode === 'full-wrap' ? '1792x1024' : '1024x1792'

  const response = await client.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size,
    quality: 'hd',
    style: 'vivid',
  })

  const img = response.data?.[0]
  if (!img?.url) throw new Error('No image URL returned from OpenAI')

  const [w, h] = size.split('x').map(Number)
  return {
    imageUrl: img.url,
    revisedPrompt: img.revised_prompt ?? prompt,
    width: w,
    height: h,
    provider: 'openai',
  }
}

async function generateWithIdeogram(prompt: string, mode: string): Promise<GenerationResult> {
  const aspectRatio = mode === 'full-wrap' ? 'ASPECT_16_9' : 'ASPECT_2_3'

  const res = await fetch('https://api.ideogram.ai/generate', {
    method: 'POST',
    headers: {
      'Api-Key': process.env.IDEOGRAM_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_request: {
        prompt,
        aspect_ratio: aspectRatio,
        model: 'V_2',
        magic_prompt_option: 'AUTO',
        style_type: 'REALISTIC',
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Ideogram error: ${err}`)
  }

  const data = await res.json()
  const img = data.data?.[0]
  if (!img) throw new Error('No image returned from Ideogram')

  return {
    imageUrl: img.url,
    revisedPrompt: img.prompt ?? prompt,
    width: img.width ?? 1344,
    height: img.height ?? 768,
    provider: 'ideogram',
  }
}

export async function generateMultipleConcepts(
  input: GenerationInput,
  count: number = 3
): Promise<GenerationResult[]> {
  const tasks = Array.from({ length: count }, () => generateCoverImage(input, 'full-wrap'))
  return Promise.allSettled(tasks).then(results =>
    results
      .filter((r): r is PromiseFulfilledResult<GenerationResult> => r.status === 'fulfilled')
      .map(r => r.value)
  )
}
