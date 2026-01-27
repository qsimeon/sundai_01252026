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
  const wordCount = lyrics.trim().split(/\s+/).length
  const targetDuration = Math.max(15, Math.min(180, wordCount * 2.5))

  return `
Dark ambient synthesizer music in the style of Eulogy from Stranger Things.

User text: "${lyrics}"

Create ${config.descriptors.join(', ')} atmospheric instrumental music.
Music should be ${targetDuration} seconds long with ${config.tempo}.
${config.intensity} progression with emotional depth.

Instrumentation:
- Haunting synthesizer melodies with ethereal pads
- Wordless vocal-like tones and atmospheric textures  
- Deep resonant bass frequencies
- Heavy reverb and delay effects
- No drums or percussion

Musical structure:
- Slow, evolving soundscapes that breathe and swell
- Melodic fragments that suggest the emotional contour of the text
- Dynamic range from subtle whispers to powerful crescendos
- Organic, analog synthesizer warmth with digital precision

Mood: ${config.descriptors.join(', ')}
Tempo: ${config.tempo}
Duration: ${targetDuration} seconds
Style: Dark ambient, cinematic, haunting
  `.trim()
}
