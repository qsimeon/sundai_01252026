import { generateSpeech, generateInstrumentalMusic } from '@/lib/replicate-client'
import { createVocalToInstrumentPrompt } from '@/lib/prompt-engineer'
import type { GenerationRequest, GenerationResponse } from '@/lib/types'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: GenerationRequest = await req.json()
    const { lyrics, mood = 'eerie' } = body

    console.log('[API] Received generation request:', { lyricsLength: lyrics?.length, mood })

    if (!lyrics || typeof lyrics !== 'string') {
      console.warn('[API] Invalid input: lyrics is required and must be a string')
      return NextResponse.json(
        { error: 'lyrics is required and must be a string' },
        { status: 400 }
      )
    }

    if (lyrics.trim().length === 0) {
      console.warn('[API] Invalid input: lyrics cannot be empty')
      return NextResponse.json(
        { error: 'lyrics cannot be empty' },
        { status: 400 }
      )
    }

    if (lyrics.length > 500) {
      console.warn('[API] Invalid input: lyrics exceed 500 characters')
      return NextResponse.json(
        { error: 'lyrics cannot exceed 500 characters' },
        { status: 400 }
      )
    }

    console.log('[API] Step 1: Generating speech from text...')
    console.log('[API] Input text:', lyrics)
    const speechUrl = await generateSpeech(lyrics)
    console.log('[API] ✓ Speech generated successfully')
    console.log('[API] Speech URL:', speechUrl)

    if (!speechUrl) {
      throw new Error('Failed to generate speech URL')
    }

    console.log('[API] Step 2: Generating instrumental music...')
    console.log('[API] Mood:', mood)
    const prompt = createVocalToInstrumentPrompt(lyrics, mood)
    console.log('[API] Prompt created:', prompt.substring(0, 100) + '...')
    const prediction = await generateInstrumentalMusic(prompt, speechUrl)
    console.log('[API] ✓ Music generation prediction created')
    console.log('[API] Prediction ID:', prediction.id)
    console.log('[API] Prediction status:', prediction.status)

    const response: GenerationResponse = {
      speechUrl: speechUrl,
      predictionId: prediction.id,
      status: 'processing',
    }

    console.log('[API] ✓ Returning response to client')
    return NextResponse.json(response)
  } catch (error) {
    console.error('[API] ❌ Generation error:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to generate music'
    console.error('[API] Error message:', errorMessage)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
