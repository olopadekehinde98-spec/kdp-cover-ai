import { NextResponse } from 'next/server'

// Diagnostic endpoint — no auth needed
export async function GET() {
  const results: Record<string, any> = {
    env: {
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      hasDB: !!process.env.DATABASE_URL,
      nodeVersion: process.version,
      platform: process.platform,
    },
    sharp: { ok: false },
    pollinations: { ok: false },
    openai: { ok: false },
    fullPipeline: { ok: false },
  }

  // Test 1: sharp
  try {
    const sharp = (await import('sharp')).default
    const png = await sharp({ create: { width: 4, height: 4, channels: 3, background: { r: 255, g: 0, b: 0 } } }).png().toBuffer()
    const jpg = await sharp(png).jpeg({ quality: 80 }).toBuffer()
    results.sharp = { ok: jpg[0] === 0xFF && jpg[1] === 0xD8, bytes: jpg.length }
  } catch (e: any) { results.sharp = { ok: false, error: e.message } }

  // Test 2: Pollinations
  try {
    const url = `https://image.pollinations.ai/prompt/red%20book?width=256&height=384&seed=1&model=flux&nologo=true&format=jpeg`
    const res = await fetch(url, { redirect: 'follow' })
    if (res.ok) {
      const bytes = Buffer.from(await res.arrayBuffer())
      results.pollinations = { ok: true, bytes: bytes.length, isJpeg: bytes[0] === 0xFF && bytes[1] === 0xD8 }
    } else { results.pollinations = { ok: false, error: `HTTP ${res.status}` } }
  } catch (e: any) { results.pollinations = { ok: false, error: e.message } }

  // Test 3: OpenAI via direct fetch (bypass SDK ByteString issue)
  if (process.env.OPENAI_API_KEY) {
    try {
      const apiKey = (process.env.OPENAI_API_KEY ?? '').replace(/^﻿/, '').trim()
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt: 'A simple red square on white background',
          n: 1,
          size: '1024x1024',
          quality: 'low',
        }),
      })
      if (res.ok) {
        const data = await res.json() as any
        const img = data.data?.[0]
        if (img?.b64_json) {
          const bytes = Buffer.from(img.b64_json, 'base64')
          results.openai = { ok: true, source: 'b64_json', bytes: bytes.length, isJpeg: bytes[0] === 0xFF && bytes[1] === 0xD8, isPng: bytes[0] === 0x89 && bytes[1] === 0x50 }
        } else if (img?.url) {
          results.openai = { ok: true, source: 'url', urlPreview: img.url.substring(0, 60) }
        } else {
          results.openai = { ok: false, error: 'No image data in response', data: JSON.stringify(data).substring(0, 200) }
        }
      } else {
        const err = await res.text()
        results.openai = { ok: false, error: `HTTP ${res.status}`, detail: err.substring(0, 200) }
      }
    } catch (e: any) { results.openai = { ok: false, error: e.message } }
  }

  // Test 4: Full pipeline — Pollinations → sharp → pdf-lib
  try {
    const sharp = (await import('sharp')).default
    const { PDFDocument } = await import('pdf-lib')

    // Step A: Get image
    const url = `https://image.pollinations.ai/prompt/book%20cover%20test?width=256&height=384&seed=99&model=flux&nologo=true&format=jpeg`
    const imgRes = await fetch(url, { redirect: 'follow' })
    if (!imgRes.ok) throw new Error(`Pollinations fetch failed: ${imgRes.status}`)
    const rawBytes = Buffer.from(await imgRes.arrayBuffer())

    // Step B: Convert to JPEG (simulate generate route)
    const jpegBytes = await sharp(rawBytes).jpeg({ quality: 92 }).toBuffer()
    const base64Stored = `data:image/jpeg;base64,${jpegBytes.toString('base64')}`

    // Step C: Decode from stored base64 (simulate pdf export)
    const decoded = Buffer.from(base64Stored.split(',')[1], 'base64')

    // Step D: Convert again with sharp (pdf-generator step)
    const finalJpeg = await sharp(decoded).jpeg({ quality: 92 }).toBuffer()
    const isJpeg = finalJpeg[0] === 0xFF && finalJpeg[1] === 0xD8

    // Step E: Embed in pdf-lib
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([256, 384])
    const img = await pdfDoc.embedJpg(new Uint8Array(finalJpeg))
    page.drawImage(img, { x: 0, y: 0, width: 256, height: 384 })
    const pdfBytes = await pdfDoc.save()

    results.fullPipeline = {
      ok: true,
      steps: {
        pollinationsFetch: `${rawBytes.length} bytes`,
        sharpConvert: `${jpegBytes.length} bytes JPEG`,
        base64Store: `${base64Stored.length} chars`,
        decode: `${decoded.length} bytes`,
        finalJpeg: `${finalJpeg.length} bytes, isJpeg=${isJpeg}`,
        pdfGenerate: `${pdfBytes.length} bytes PDF`,
      }
    }
  } catch (e: any) { results.fullPipeline = { ok: false, error: e.message, stack: e.stack?.substring(0, 500) } }

  return NextResponse.json(results, { status: 200 })
}
