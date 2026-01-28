import { generateInstrumentalMusic } from '@/lib/replicate-client'
import { createVocalToInstrumentPrompt } from '@/lib/prompt-engineer'
import { GenerationRequestSchema, GenerationResponseSchema } from '@/lib/schemas'
import { ValidationError, formatErrorResponse } from '@/lib/errors'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
    console.log('[API] Received generation request:', { lyricsLength: body.lyrics?.length, mood: body.mood })

    // Validate input with Zod
    const result = GenerationRequestSchema.safeParse(body)
    if (!result.success) {
      const validationError = ValidationError.fromZodError(result.error)
      console.warn('[API] Validation error:', validationError.message)
      const { statusCode, body: errorBody } = formatErrorResponse(validationError)
      return NextResponse.json(errorBody, { status: statusCode })
    }

    const { lyrics, mood } = result.data

    console.log('[API] Step 1: Creating music prompt...')
    const prompt = createVocalToInstrumentPrompt(lyrics, mood)
    console.log('[API] Prompt created:', prompt.substring(0, 100) + '...')

console.log('[API] Step 2: Generating instrumental music from text...')
    const musicPrompt = createVocalToInstrumentPrompt(lyrics, mood)
    console.log('[API] Prompt created:', musicPrompt.substring(0, 100) + '...')
    const prediction = await generateInstrumentalMusic(musicPrompt, lyrics)
    console.log('[API] ✓ Music generation prediction created')

    // For synchronous wait, check if prediction completed immediately
    if (prediction.status === 'succeeded') {
      console.log('[API] ✓ Prediction completed immediately!')
      return NextResponse.json({
        predictionId: prediction.id,
        status: 'completed',
        instrumentalUrl: Array.isArray(prediction.output) ? prediction.output[0] : prediction.output,
      })
    } else if (prediction.status === 'failed') {
      console.error('[API] ❌ Prediction failed:', prediction.error)
      return NextResponse.json(
        { error: prediction.error || 'Generation failed' },
        { status: 500 }
      )
    }

    // Validate response before sending (processing state for client compatibility)
    const response = GenerationResponseSchema.parse({
      predictionId: prediction.id,
      status: 'processing',
    })

    console.log('[API] ✓ Returning prediction ID to client (waiting for completion)')
    return NextResponse.json(response)
  } catch (error) {
    console.error('[API] ❌ Generation error:', error)
    const { statusCode, body: errorBody } = formatErrorResponse(error)
    return NextResponse.json(errorBody, { status: statusCode })
  }
}
