import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// Simple PDF text extractor â€” works for most modern PDFs with embedded text
function extractTextFromPDF(buffer: Buffer): string {
  try {
    const str = buffer.toString('latin1')
    const chunks: string[] = []
    // Find text between BT (Begin Text) and ET (End Text) PDF operators
    const btEt = /BT[\s\S]*?ET/g
    let m
    while ((m = btEt.exec(str)) !== null) {
      // Extract strings inside parentheses  (text) or hex <hex>
      const parenMatches = m[0].match(/\(([^)\\]*(?:\\.[^)\\]*)*)\)/g) ?? []
      for (const p of parenMatches) {
        const inner = p.slice(1, -1)
          .replace(/\\n/g, ' ').replace(/\\r/g, ' ')
          .replace(/\\t/g, ' ').replace(/\\\\/g, '\\')
          .replace(/\\(.)/g, '$1')
        if (inner.trim().length > 1) chunks.push(inner)
      }
    }
    const text = chunks.join(' ').replace(/\s{2,}/g, ' ').trim()
    return text.slice(0, 6000)
  } catch {
    return ''
  }
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { fileBase64, fileName, title, genre } = await req.json()
  if (!fileBase64) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  let rawText = ''

  try {
    // Decode the base64 â€” may be raw base64 or a data URL
    const base64 = fileBase64.includes(',') ? fileBase64.split(',')[1] : fileBase64
    const buffer = Buffer.from(base64, 'base64')
    const ext = (fileName as string).split('.').pop()?.toLowerCase() ?? 'txt'

    if (ext === 'pdf') {
      rawText = extractTextFromPDF(buffer)
      if (!rawText || rawText.length < 100) {
        return NextResponse.json({
          error: 'Could not extract text from this PDF. It may be a scanned image PDF. Please save your manuscript as a TXT file and try again.',
        }, { status: 422 })
      }
    } else {
      // TXT, DOCX (treat as text), EPUB â€” decode as UTF-8
      rawText = buffer.toString('utf-8').replace(/<[^>]+>/g, ' ').replace(/\s{2,}/g, ' ').trim().slice(0, 6000)
    }
  } catch (e) {
    return NextResponse.json({ error: 'Could not read the file. Try saving as TXT.' }, { status: 422 })
  }

  if (!rawText || rawText.length < 50) {
    return NextResponse.json({ error: 'File appears to be empty or unreadable. Try saving as TXT.' }, { status: 422 })
  }

  // Ask OpenAI to extract info and write back cover description
  const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const prompt = `You are a professional book editor. Read the following excerpt from a book manuscript and:

1. Try to identify the book title (if visible in the text)
2. Try to identify the author name (if visible in the text)
3. Identify the genre
4. Write a compelling 120â€“180 word back cover description that:
   - Hooks the reader in the first sentence
   - Builds tension/curiosity appropriate for the genre
   - Ends with a question or statement that makes the reader want to open the book
   - Does NOT include spoilers
   - Does NOT mention the title or author name
   - Is written in present tense
   - Is professional back-cover quality

Respond in JSON format only:
{
  "title": "extracted title or empty string",
  "authorName": "extracted author name or empty string",
  "genre": "detected genre",
  "description": "the back cover description"
}

${title ? `Note: The user says the title is "${title}"` : ''}
${genre ? `Note: The user says the genre is "${genre}"` : ''}

MANUSCRIPT EXCERPT:
${rawText.slice(0, 4000)}`

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 600,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    const result = JSON.parse(raw)

    return NextResponse.json({
      title: result.title || '',
      authorName: result.authorName || '',
      genre: result.genre || genre || '',
      description: result.description || '',
    })
  } catch (e: any) {
    console.error('book-extract OpenAI error:', e)
    return NextResponse.json({ error: 'AI extraction failed. Check your OpenAI key.' }, { status: 500 })
  }
}

