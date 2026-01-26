import type { Mood } from './types'

interface MoodConfig {
  descriptors: string[]
  tempo: string
  intensity: string
}

const MOODS: Record<Mood, MoodConfig> = {
  dark: {
    descriptors: ['ominous', 'foreboding', 'shadowy', 'malevolent'],
    tempo: 'very slow (50-60 BPM)',
    intensity: 'intense and dramatic',
  },
  eerie: {
    descriptors: ['unsettling', 'ghostly', 'ethereal', 'haunting'],
    tempo: 'slow (60-70 BPM)',
    intensity: 'subtle and creeping',
  },
  melancholic: {
    descriptors: ['sorrowful', 'wistful', 'nostalgic', 'bittersweet'],
    tempo: 'slow to medium (70-80 BPM)',
    intensity: 'gentle and emotional',
  },
}

export function createVocalToInstrumentPrompt(lyrics: string, mood: Mood = 'eerie'): string {
  const config = MOODS[mood]

  return `
Dark ambient synthesizer music in the style of Eulogy from Stranger Things.
Based on the mood and themes of: "${lyrics}"
${config.descriptors.join(', ')} atmosphere.
${config.intensity} dark ambient.
Haunting ethereal pads with wordless vocal-like tones.
Pure synthesizers, no drums or percussion.
Heavy reverb and atmospheric effects.
Capture the emotional essence and melody from the spoken words.
  `.trim()
}
