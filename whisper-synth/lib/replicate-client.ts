import Replicate from 'replicate'
import { REPLICATE_API_TOKEN } from './env'
import {
  MusicGenInputSchema,
  MusicGenPredictionSchema,
} from './schemas'
import { ReplicateError } from './errors'

const replicate = new Replicate({
  auth: REPLICATE_API_TOKEN,
})

/**
 * Calculate duration based on text length for direct text-to-music generation
 * Rough estimate: ~2 seconds per word for atmospheric music
 */
function estimateDurationFromText(text: string): number {
  const words = text.trim().split(/\s+/).length
  const secondsPerWord = 2.5 // Atmospheric music pacing
  const estimatedDuration = Math.ceil(words * secondsPerWord)
  
  // Clamp to reasonable bounds
  return Math.max(15, Math.min(180, estimatedDuration)) // 15s to 3min
}

export async function generateInstrumentalMusic(
  prompt: string,
  text: string
) {
  try {
    console.log('[REPLICATE] Creating MusicGen prediction...')
    console.log('[REPLICATE] Prompt:', prompt.substring(0, 100) + '...')
    console.log('[REPLICATE] User text:', text.substring(0, 50) + '...')

    // Estimate duration from user text instead of speech
    const duration = estimateDurationFromText(text)

    const inputObj: Record<string, unknown> = {
      prompt: prompt,
      duration: duration,
      output_format: 'wav',
      continuation: false, // false means generation mode (not continuation)
      temperature: 1,
      top_k: 250,
      top_p: 0,
      classifier_free_guidance: 3,
      normalization_strategy: 'loudness',
    }

    console.log('[REPLICATE] Estimated duration:', duration, 'seconds')
    console.log('[REPLICATE] Text-to-music generation (no audio conditioning)')

    // Validate the complete input object
    const validatedInput = MusicGenInputSchema.parse(inputObj)

    console.log('[REPLICATE] Calling fine-tuned Eulogy model...')
    const prediction = await replicate.predictions.create({
      // Fine-tuned Eulogy model for atmospheric music
      version: '93ed0f8d7560876afd2a087263a4a788716c36e59de91f83130e700fedc7b2e3',
      input: validatedInput,
    })

    console.log('[REPLICATE] ✓ Prediction created')
    console.log('[REPLICATE] Prediction ID:', prediction.id)
    console.log('[REPLICATE] Prediction status:', prediction.status)

    // Validate response structure
    return MusicGenPredictionSchema.parse(prediction)
  } catch (error) {
    console.error('[REPLICATE] ❌ MusicGen error:', error)
    if (error instanceof ReplicateError) {
      throw error
    }
    throw new ReplicateError('Failed to generate instrumental music', 502, { originalError: error })
  }
}

export async function getPredictionStatus(predictionId: string) {
  try {
    const prediction = await replicate.predictions.get(predictionId)
    // Validate response structure (works for both MiniMax and MusicGen responses)
    return MusicGenPredictionSchema.parse(prediction)
  } catch (error) {
    console.error('Error getting prediction status:', error)
    if (error instanceof ReplicateError) {
      throw error
    }
    throw new ReplicateError('Failed to get prediction status', 502, { predictionId, originalError: error })
  }
}

export { replicate }
