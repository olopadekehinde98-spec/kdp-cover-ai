import { NextResponse } from 'next/server'

// Diagnostic endpoint — no auth needed, remove after testing
export async function GET() {
  const results: Record<string, any> = {
    env: {
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      hasDB: !!process.env.DATABASE_URL,
      nodeVersion: process.version,
      platform: process.platform,
    },
    sharp: { ok: false, error: null as any },
    pollinations: { ok: false, error: null as any, bytes: 0, firstBytes: '' },
    openai: { ok: false, error: null as any, bytes: 0, format: '' },
    pdfLib: { ok: false, error: null as any },
  }

  // Test 1: sharp
  try {
    const sharp = (await import('sharp')).default
    const testPng = await sharp({
      create: { width: 4, height: 4, channels: 3, background: { r: 255, g: 0, b: 0 } }
    }).png().toBuffer()
    const testJpeg = await sharp(testPng).jpeg({ quality: 80 }).toBuffer()
    results.sharp = {
      ok: testJpeg[0] === 0xFF && testJpeg[1] === 0xD8,
      outputBytes: testJpeg.length,
      firstBytes: `0x${testJpeg[0].toString(16)} 0x${testJpeg[1].toString(16)}`,
    }
  } catch (e: any) {
    results.sharp = { ok: false, error: e.message }
  }

  // Test 2: Pollinations fetch
  try {
    const url = `https://image.pollinations.ai/prompt/red%20book%20cover?width=256&height=384&seed=1&model=flux&nologo=true&format=jpeg`
    const res = await fetch(url, { redirect: 'follow' })
    if (res.ok) {
      const bytes = Buffer.from(await res.arrayBuffer())
      results.pollinations = {
        ok: true,
        bytes: bytes.length,
        contentType: res.headers.get('content-type'),
        firstBytes: `0x${bytes[0].toString(16)} 0x${bytes[1].toString(16)}`,
        isJpeg: bytes[0] === 0xFF && bytes[1] === 0xD8,
        isPng: bytes[0] === 0x89 && bytes[1] === 0x50,
      }
    } else {
      results.pollinations = { ok: false, error: `HTTP ${res.status}` }
    }
  } catch (e: any) {
    results.pollinations = { ok: false, error: e.message }
  }

  // Test 3: OpenAI gpt-image-1 (only if key present)
  if (process.env.OPENAI_API_KEY) {
    try {
      const { default: OpenAI } = await import('openai')
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const response = await client.images.generate({
        model: 'gpt-image-1',
        prompt: 'A simple red square',
        n: 1,
        size: '1024x1024',
        quality: 'low',
      })
      const img = response.data?.[0]
      if (img?.b64_json) {
        const bytes = Buffer.from(img.b64_json, 'base64')
        results.openai = {
          ok: true,
          source: 'b64_json',
          bytes: bytes.length,
          firstBytes: `0x${bytes[0].toString(16)} 0x${bytes[1].toString(16)}`,
          isJpeg: bytes[0] === 0xFF && bytes[1] === 0xD8,
          isPng: bytes[0] === 0x89 && bytes[1] === 0x50,
        }
      } else if (img?.url) {
        results.openai = { ok: true, source: 'url', url: img.url.substring(0, 80) }
      } else {
        results.openai = { ok: false, error: 'No data returned' }
      }
    } catch (e: any) {
      results.openai = { ok: false, error: e.message }
    }
  } else {
    results.openai = { ok: false, error: 'No OpenAI API key set' }
  }

  // Test 4: pdf-lib embedding with a test JPEG
  try {
    const { PDFDocument } = await import('pdf-lib')
    // Minimal JPEG (a valid 1x1 red pixel JPEG)
    const minimalJpeg = Buffer.from(
      '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJQAB/9k=',
      'base64'
    )
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([100, 100])
    const img = await pdfDoc.embedJpg(new Uint8Array(minimalJpeg))
    page.drawImage(img, { x: 0, y: 0, width: 100, height: 100 })
    const pdfBytes = await pdfDoc.save()
    results.pdfLib = { ok: true, pdfBytes: pdfBytes.length }
  } catch (e: any) {
    results.pdfLib = { ok: false, error: e.message }
  }

  return NextResponse.json(results, { status: 200 })
}
