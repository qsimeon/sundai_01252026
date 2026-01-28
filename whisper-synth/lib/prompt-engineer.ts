import type { Mood } from './schemas'

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
Eulogy-style dark ambient music inspired by: "${lyrics}"

${config.descriptors.join(', ')} atmosphere.
Haunting synthesizers with ethereal vocal-like tones.
Heavy reverb, no drums, pure atmospheric synthesis.
${config.intensity} emotional progression.
Style: Dark ambient, cinematic, haunting from Stranger Things.
  `.trim()
}
