import { getPredictionStatus } from '@/lib/replicate-client'
import type { PredictionStatus } from '@/lib/types'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id || typeof id !== 'string') {
      console.warn('[POLL] Missing prediction ID')
      return NextResponse.json(
        { error: 'Missing prediction ID' },
        { status: 400 }
      )
    }

    console.log('[POLL] Checking status for prediction:', id)
    const prediction = await getPredictionStatus(id)
    console.log('[POLL] Prediction status:', prediction.status)

    if (prediction.status === 'succeeded') {
      console.log('[POLL] ✓ Prediction succeeded')
      console.log('[POLL] Output:', typeof prediction.output, Array.isArray(prediction.output) ? `(array of ${prediction.output.length})` : '')
    } else if (prediction.status === 'failed') {
      console.log('[POLL] ❌ Prediction failed:', prediction.error)
    } else {
      console.log('[POLL] Still processing... status:', prediction.status)
    }

    const response: PredictionStatus = {
      status: prediction.status,
      output: prediction.output,
      error: prediction.error,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[POLL] ❌ Poll error:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to get prediction status'
    console.error('[POLL] Error message:', errorMessage)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
