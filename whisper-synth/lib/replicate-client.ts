import Replicate from 'replicate'

if (!process.env.REPLICATE_API_TOKEN) {
  throw new Error('REPLICATE_API_TOKEN is not set')
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function generateSpeech(text: string): Promise<string> {
  try {
    console.log('[REPLICATE] Calling MiniMax Speech-02-HD TTS...')
    console.log('[REPLICATE] Input text length:', text.length)

    const output = await replicate.run('minimax/speech-02-hd', {
      input: {
        text: text,
        voice_id: 'male-qn-qingse', // Clear, expressive male voice
      },
    })

    console.log('[REPLICATE] MiniMax output received, type:', typeof output, Array.isArray(output) ? '(array)' : '')

    if (typeof output === 'string') {
      console.log('[REPLICATE] ✓ Output is string URL')
      return output
    }

    if (Array.isArray(output)) {
      console.log('[REPLICATE] ✓ Output is array, using first element')
      return output[0] as string
    }

    if (typeof output === 'object' && output !== null) {
      console.log('[REPLICATE] Output is object, extracting audio URL')
      const audioOutput = (output as any).audio_out || (output as any).audio || (output as any)[0]
      return typeof audioOutput === 'string' ? audioOutput : String(audioOutput)
    }

    console.log('[REPLICATE] Converting output to string')
    return String(output)
  } catch (error) {
    console.error('[REPLICATE] ❌ MiniMax TTS error:', error)
    throw new Error('Failed to generate speech from text')
  }
}

export async function generateInstrumentalMusic(
  prompt: string,
  inputAudioUrl?: string
): Promise<any> {
  try {
    console.log('[REPLICATE] Creating MusicGen prediction...')
    console.log('[REPLICATE] Prompt:', prompt.substring(0, 100) + '...')
    console.log('[REPLICATE] Input audio URL provided:', !!inputAudioUrl)

    const input: any = {
      prompt: prompt,
      duration: 30,
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
      input.input_audio = inputAudioUrl
      console.log('[REPLICATE] Using input_audio for melody conditioning')
    }

    console.log('[REPLICATE] Calling fine-tuned Eulogy MELODY model...')
    const prediction = await replicate.predictions.create({
      // NEW MELODY-CONDITIONED MODEL - trained with model_version: "melody"
      version: '93ed0f8d7560876afd2a087263a4a788716c36e59de91f83130e700fedc7b2e3',
      input: input,
    })

    console.log('[REPLICATE] ✓ Prediction created')
    console.log('[REPLICATE] Prediction ID:', prediction.id)
    console.log('[REPLICATE] Prediction status:', prediction.status)

    return prediction
  } catch (error) {
    console.error('[REPLICATE] ❌ MusicGen error:', error)
    throw new Error('Failed to generate instrumental music')
  }
}

export async function getPredictionStatus(predictionId: string): Promise<any> {
  try {
    const prediction = await replicate.predictions.get(predictionId)
    return prediction
  } catch (error) {
    console.error('Error getting prediction status:', error)
    throw new Error('Failed to get prediction status')
  }
}

export { replicate }
