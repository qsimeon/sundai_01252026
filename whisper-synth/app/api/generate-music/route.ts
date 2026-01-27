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
    const prediction = await generateInstrumentalMusic(prompt, lyrics)
    console.log('[API] ✓ Music generation prediction created')

    // Validate response before sending
    const response = GenerationResponseSchema.parse({
      predictionId: prediction.id,
      status: 'processing',
    })

    console.log('[API] ✓ Returning response to client')
    return NextResponse.json(response)
  } catch (error) {
    console.error('[API] ❌ Generation error:', error)
    const { statusCode, body: errorBody } = formatErrorResponse(error)
    return NextResponse.json(errorBody, { status: statusCode })
  }
}
