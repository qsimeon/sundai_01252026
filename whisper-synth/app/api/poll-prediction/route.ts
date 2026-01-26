import { getPredictionStatus } from '@/lib/replicate-client'
import { PollQueryParamsSchema, PredictionResultSchema } from '@/lib/schemas'
import { ValidationError, formatErrorResponse } from '@/lib/errors'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    // Validate query params
    const result = PollQueryParamsSchema.safeParse({ id })
    if (!result.success) {
      const validationError = ValidationError.fromZodError(result.error)
      console.warn('[POLL] Validation error:', validationError.message)
      const { statusCode, body: errorBody } = formatErrorResponse(validationError)
      return NextResponse.json(errorBody, { status: statusCode })
    }

    const { id: predictionId } = result.data

    console.log('[POLL] Checking status for prediction:', predictionId)
    const prediction = await getPredictionStatus(predictionId)
    console.log('[POLL] Prediction status:', prediction.status)

    if (prediction.status === 'succeeded') {
      console.log('[POLL] ✓ Prediction succeeded')
      console.log('[POLL] Output:', typeof prediction.output, Array.isArray(prediction.output) ? `(array of ${prediction.output.length})` : '')
    } else if (prediction.status === 'failed') {
      console.log('[POLL] ❌ Prediction failed:', prediction.error)
    } else {
      console.log('[POLL] Still processing... status:', prediction.status)
    }

    // Validate response before sending
    const response = PredictionResultSchema.parse({
      status: prediction.status,
      output: prediction.output,
      error: prediction.error,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('[POLL] ❌ Poll error:', error)
    const { statusCode, body: errorBody } = formatErrorResponse(error)
    return NextResponse.json(errorBody, { status: statusCode })
  }
}
