export type Mood = 'dark' | 'eerie' | 'melancholic'

export interface GenerationRequest {
  lyrics: string
  mood?: Mood
}

export interface GenerationResponse {
  speechUrl: string
  predictionId: string
  status: 'processing'
}

export interface PredictionStatus {
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  output: string | null
  error: string | null
}

export interface GenerationComplete {
  speechUrl: string
  instrumentalUrl: string
  prompt: string
}
