import type { GenerationInput, GenerationResult } from './types'
import { enhancePrompt } from './prompt-enhancer'

export async function generateCoverImage(
  input: GenerationInput,
  mode: 'full-wrap' | 'front-only' = 'full-wrap'
): Promise<GenerationResult> {
  const enhancedPrompt = enhancePrompt(input, mode === 'full-wrap' ? 'full-wrap' : '2:3')

  // Priority: Ideogram (paid, best quality) → OpenAI gpt-image-1 (paid) → Pollinations (free, no key needed)
  if (process.env.IDEOGRAM_API_KEY) {
    try { return await generateWithIdeogram(enhancedPrompt, mode) } catch (e) {
      console.warn('Ideogram failed, falling back:', e)
    }
  }
  if (process.env.OPENAI_API_KEY) {
    try { return await generateWithOpenAI(enhancedPrompt, mode) } catch (e) {
      console.warn('OpenAI failed, falling back to Pollinations:', e)
    }
  }
  return generateWithPollinations(enhancedPrompt, mode)
}

// FREE — no API key required, powered by Stable Diffusion XL
async function generateWithPollinations(prompt: string, mode: string): Promise<GenerationResult> {
  const width = mode === 'full-wrap' ? 1792 : 1024
  const height = mode === 'full-wrap' ? 1024 : 1536

  // Pollinations generates images via a simple URL — completely free
  const encodedPrompt = encodeURIComponent(prompt)
  const seed = Math.floor(Math.random() * 999999)
  // force jpeg so pdf-lib can always embed it
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true&format=jpeg`

  // Fetch with a generous timeout — Pollinations can take 20-30s on first generation
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 50000)
  const res = await fetch(imageUrl, { method: 'HEAD', signal: controller.signal, redirect: 'follow' })
  clearTimeout(timeout)
  if (!res.ok) throw new Error(`Pollinations error: ${res.status}`)

  return {
    imageUrl,
    revisedPrompt: prompt,
    width,
    height,
    provider: 'pollinations',
  }
}

async function generateWithOpenAI(prompt: string, mode: string): Promise<GenerationResult> {
  // gpt-image-1 supported sizes: 1024x1024, 1536x1024 (landscape), 1024x1536 (portrait)
  const size = mode === 'full-wrap' ? '1536x1024' : '1024x1536'
  const [w, h] = size.split('x').map(Number)

  // Use direct fetch to avoid openai SDK ByteString bug on Node.js v24
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      n: 1,
      size,
      quality: 'high',
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`OpenAI API error ${res.status}: ${errText.substring(0, 200)}`)
  }

  const data = await res.json() as { data?: Array<{ b64_json?: string; url?: string; revised_prompt?: string }> }
  const img = data.data?.[0]
  if (!img) throw new Error('No image returned from OpenAI')

  // gpt-image-1 returns base64 PNG by default
  if (img.b64_json) {
    return {
      imageUrl: `data:image/png;base64,${img.b64_json}`,
      revisedPrompt: prompt,
      width: w,
      height: h,
      provider: 'openai',
    }
  }

  if (!img.url) throw new Error('No image data returned from OpenAI')
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
