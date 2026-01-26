import Replicate from 'replicate'
import { REPLICATE_API_TOKEN, OPENAI_API_KEY } from './env'
import {
  AudioUrlSchema,
  MusicGenInputSchema,
  MusicGenPredictionSchema,
} from './schemas'
import { ReplicateError } from './errors'

const replicate = new Replicate({
  auth: REPLICATE_API_TOKEN,
})

/**
 * Calculate audio duration from MP3 file
 * Rough estimate: MP3 bitrate is typically 128kbps for TTS
 */
function estimateAudioDuration(mp3Buffer: ArrayBuffer): number {
  // For MP3, we can estimate from file size
  // Standard TTS (tts-1) uses ~128kbps encoding
  const fileSizeBytes = mp3Buffer.byteLength
  const bitrate = 128 * 1024 // 128 kbps in bits per second
  const durationSeconds = (fileSizeBytes * 8) / bitrate

  // Round up to ensure we don't cut off the audio
  return Math.ceil(durationSeconds)
}

export async function generateSpeech(text: string): Promise<{ dataUrl: string; duration: number }> {
  try {
    console.log('[OPENAI] Generating speech with TTS...')
    console.log('[OPENAI] Input text length:', text.length)

    // Use OpenAI's TTS API directly via fetch
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: 'alloy',
        input: text,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`)
    }

    // Get the audio as a buffer
    const buffer = await response.arrayBuffer()

    // Estimate duration from file size
    const duration = estimateAudioDuration(buffer)
    console.log('[OPENAI] ✓ Speech generated successfully, duration:', duration, 'seconds')

    // Convert to base64 data URL for passing to music model
    const base64 = Buffer.from(buffer).toString('base64')
    const dataUrl = `data:audio/mp3;base64,${base64}`

    return { dataUrl, duration }
  } catch (error) {
    console.error('[OPENAI] ❌ TTS error:', error)
    throw new ReplicateError('Failed to generate speech', 502, { originalError: error })
  }
}

export async function generateInstrumentalMusic(
  prompt: string,
  inputAudioUrl?: string,
  inputAudioDuration?: number
) {
  try {
    console.log('[REPLICATE] Creating MusicGen prediction...')
    console.log('[REPLICATE] Prompt:', prompt.substring(0, 100) + '...')
    console.log('[REPLICATE] Input audio URL provided:', !!inputAudioUrl)
    console.log('[REPLICATE] Input audio duration:', inputAudioDuration, 'seconds')

    // Use input audio duration if provided, otherwise default to 30s
    const duration = inputAudioDuration || 30

    const inputObj: Record<string, unknown> = {
      prompt: prompt,
      duration: duration,
      output_format: 'wav',
      continuation: false, // CRITICAL: false means melody conditioning mode
      temperature: 1,
      top_k: 250,
      top_p: 0,
      classifier_free_guidance: 3,
      normalization_strategy: 'loudness',
    }

    // Use TTS speech as melodic guide for fine-tuned Eulogy model
    if (inputAudioUrl) {
      // Validate that it's a proper URL
      try {
        const validatedUrl = AudioUrlSchema.parse(inputAudioUrl)
        inputObj.input_audio = validatedUrl
        console.log('[REPLICATE] ✓ Using input_audio for melody conditioning')
      } catch {
        console.warn('[REPLICATE] ⚠ Input audio URL is not a valid URL, proceeding without it:', inputAudioUrl)
      }
    } else {
      console.warn('[REPLICATE] ⚠ No valid input audio URL provided')
    }

    // Validate the complete input object
    const validatedInput = MusicGenInputSchema.parse(inputObj)

    console.log('[REPLICATE] Calling fine-tuned Eulogy MELODY model...')
    const prediction = await replicate.predictions.create({
      // NEW MELODY-CONDITIONED MODEL - trained with model_version: "melody"
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
