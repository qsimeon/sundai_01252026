'use client'

import { useState } from 'react'
import type { Mood } from '@/lib/schemas'
import { GenerationRequestSchema, GenerationResponseSchema, PredictionResultSchema } from '@/lib/schemas'
import { AudioPlayer } from './AudioPlayer'

type GenerationStep = 'idle' | 'generating' | 'complete'

export function MusicGenerator() {
  const [lyrics, setLyrics] = useState('')
  const [mood, setMood] = useState<Mood>('eerie')
  const [currentStep, setCurrentStep] = useState<GenerationStep>('idle')
  const [instrumentalUrl, setInstrumentalUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleGenerate() {
    setError(null)
    setIsLoading(true)
    setCurrentStep('generating')
    setInstrumentalUrl(null)

    console.log('[CLIENT] Starting generation with mood:', mood)

    try {
      // Pre-validate request before sending
      const requestBody = { lyrics, mood }
      const validationResult = GenerationRequestSchema.safeParse(requestBody)
      if (!validationResult.success) {
        const errors = validationResult.error.issues.map((i) => i.message).join(', ')
        throw new Error(`Validation error: ${errors}`)
      }

      console.log('[CLIENT] Calling /api/generate-music...')
      const res = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validationResult.data),
      })

      const data = await res.json()
      console.log('[CLIENT] API response:', data)

      if (!res.ok) {
        throw new Error(data.error || 'Generation failed')
      }

      // Validate API response
      const responseValidation = GenerationResponseSchema.safeParse(data)
      if (!responseValidation.success) {
        throw new Error('Invalid response from server')
      }

      console.log('[CLIENT] Music generation started, polling for completion...')
      const instrumentalUrl = await pollForCompletion(responseValidation.data.predictionId)
      setInstrumentalUrl(instrumentalUrl)
      console.log('[CLIENT] ✓ Generation complete!')
      setCurrentStep('complete')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Generation failed'
      console.error('[CLIENT] ❌ Error:', errorMsg)
      setError(errorMsg)
      setCurrentStep('idle')
    } finally {
      setIsLoading(false)
    }
  }

  async function pollForCompletion(predictionId: string): Promise<string> {
    console.log('[CLIENT] Polling for prediction:', predictionId)
    let pollCount = 0
    const maxRetries = 180

    while (pollCount < maxRetries) {
      try {
        console.log(`[CLIENT] Poll attempt ${pollCount + 1}/${maxRetries}...`)
        const res = await fetch(`/api/poll-prediction?id=${predictionId}`)
        const data = await res.json()

        // Validate response schema
        const validationResult = PredictionResultSchema.safeParse(data)
        if (!validationResult.success) {
          throw new Error('Invalid polling response from server')
        }

        const result = validationResult.data
        console.log('[CLIENT] Poll response status:', result.status)

        if (result.status === 'succeeded') {
          console.log('[CLIENT] ✓ Prediction succeeded!')
          const output = Array.isArray(result.output) ? result.output[0] : result.output
          if (!output) {
            throw new Error('No output received from prediction')
          }
          console.log('[CLIENT] Output URL:', output)
          return output
        } else if (result.status === 'failed') {
          console.error('[CLIENT] ❌ Prediction failed:', result.error)
          throw new Error(result.error || 'Generation failed')
        }

        console.log('[CLIENT] Still processing, waiting 2 seconds...')
        await new Promise((resolve) => setTimeout(resolve, 2000))
        pollCount++
      } catch (err) {
        if (err instanceof Error && err.message.includes('Generation failed')) {
          throw err
        }
        pollCount++
        if (pollCount >= maxRetries) {
          throw new Error('Generation timed out after 6 minutes')
        }
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }

    throw new Error('Generation timed out')
  }

  const getStepLabel = () => {
    switch (currentStep) {
      case 'generating':
        return 'Creating haunting instrumental music...'
      case 'complete':
        return 'Complete'
      default:
        return null
    }
  }

  return (
    <div className="text-neutral-300">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-lg font-medium text-neutral-100 tracking-tight mb-1">Whisper Synth</h1>
        <p className="text-xs text-neutral-500">Transform your words into haunting, ethereal instrumental music</p>
      </header>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Input Section */}
        {currentStep === 'idle' && !instrumentalUrl && (
          <>
            <div className="space-y-2">
              <label className="block text-xs text-neutral-500 uppercase tracking-wider">
                Your lyrics or text
              </label>
              <textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="Enter something poetic, mysterious, or haunting..."
                className="w-full h-20 px-4 py-3 bg-neutral-800 rounded-lg text-neutral-200 placeholder-neutral-600 focus:outline-none border-none resize-none text-sm"
                maxLength={500}
                disabled={isLoading}
              />
              <div className="flex justify-between items-center text-xs text-neutral-600">
                <span></span>
                <span>{lyrics.length} / 500</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3 items-end">
              <div className="flex-1 space-y-2">
                <label className="block text-xs text-neutral-500 uppercase tracking-wider">
                  Atmosphere
                </label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value as Mood)}
                  className="w-full px-4 py-3 bg-neutral-800 rounded-lg text-neutral-200 focus:outline-none border-none text-sm cursor-pointer"
                  disabled={isLoading}
                >
                  <option value="dark">Dark & Ominous</option>
                  <option value="eerie">Eerie & Ghostly</option>
                  <option value="melancholic">Melancholic & Sorrowful</option>
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!lyrics.trim() || isLoading}
                className="mt-2 px-4 py-3 bg-neutral-100 text-neutral-900 text-sm font-medium rounded-lg hover:bg-white disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </>
        )}

        {/* Progress Section */}
        {currentStep === 'generating' && (
          <div className="space-y-4 text-center py-8">
            <div className="text-neutral-400 text-sm space-y-2">
              {getStepLabel() && (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-neutral-300 rounded-full animate-pulse"></div>
                  <span>{getStepLabel()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Section */}
        {error && (
          <div className="border border-red-900 bg-red-950/30 px-4 py-3 text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Output Section */}
        {instrumentalUrl && (
          <div className="space-y-6">
            <div className="space-y-2 mb-6">
              <h2 className="text-sm font-medium text-neutral-100">Your Haunting Instrumental</h2>
              <p className="text-xs text-neutral-500">Generated from your words</p>
            </div>

            <AudioPlayer url={instrumentalUrl} label="Final Instrumental" />

            <button
              onClick={() => {
                setInstrumentalUrl(null)
                setLyrics('')
                setCurrentStep('idle')
              }}
              className="w-full px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-medium rounded-lg uppercase tracking-wider transition-colors mt-8"
            >
              Create Another
            </button>
          </div>
        )}
      </div>

    </div>
  )
}
