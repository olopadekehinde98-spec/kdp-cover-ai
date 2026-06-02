import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import OpenAI from 'openai'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { plan: true } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // AI description is a PRO+ feature
  if (user.plan === 'FREE' || user.plan === 'STARTER') {
    return NextResponse.json(
      { error: 'AI back cover description is a Pro feature. Upgrade to use it.' },
      { status: 403 }
    )
  }

  const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const { title, genre, authorName, description } = await req.json()

  if (!title || !genre) {
    return NextResponse.json({ error: 'Title and genre are required.' }, { status: 400 })
  }

  const prompt = `Write a compelling back cover book description for a ${genre} book.

Book Title: ${title}
Author: ${authorName || 'Unknown'}
Genre: ${genre}
${description ? `Author's draft description: ${description}` : ''}

Requirements:
- 120â€“180 words
- Hook the reader in the first sentence
- Build tension or curiosity appropriate for ${genre}
- End with a compelling question or statement that makes the reader want to open the book
- No spoilers
- Do NOT include the book title or author name in the text
- Write in present tense
- Professional back-cover quality

Return only the description text, nothing else.`

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.8,
    })

    const text = completion.choices[0]?.message?.content?.trim() ?? ''
    if (!text) return NextResponse.json({ error: 'AI returned empty response. Try again.' }, { status: 500 })

    return NextResponse.json({ description: text })
  } catch (e: any) {
    console.error('AI description error:', e)
    return NextResponse.json({ error: 'AI generation failed. Check your OpenAI key.' }, { status: 500 })
  }
}

