# Whisper Synth - Music Hack Plan

## Name
**Whisper Synth**

## Comments
A web app that transforms text into haunting, vocal-like instrumental music similar to "Eulogy" from the Stranger Things soundtrack. The app uses a multi-step pipeline: user types lyrics → text-to-speech generates spoken vocals → voice-to-instrument AI transforms the speech into ethereal, wordless instrumental music with synthesizer/theremin-like timbres that "almost" sound like singing but have no clear words.

This implementation uses a TTS intermediate step (rather than direct text-to-music) to achieve the unique "almost vocal" quality - starting with actual human-like speech, then transforming it into haunting instrumental synthesis.

## Tech Stack

### Frontend
- **Next.js 14+** (App Router) - Server components + client components
- **React 18+** - UI interactions
- **TailwindCSS** - Styling with dark theme
- **TypeScript** - Type safety

### Backend
- **Next.js API Routes** - Serverless functions on Vercel
- **Replicate SDK** - AI model orchestration

### AI Services
1. **MiniMax Speech-02-HD** via Replicate - Industry-leading text-to-speech ✅ NEW
   - Model: `minimax/speech-02-hd`
   - **Why this model**: Ranked #1 on Artificial Analysis Speech Arena and Hugging Face TTS Arena
   - **Quality**: Outperforms OpenAI and ElevenLabs in benchmarks
   - **Key Features**:
     - Crystal-clear, highly understandable speech (fixes Bark's poor quality)
     - Excellent musicality and expressiveness
     - 300+ pre-built voices across different demographics
     - 99% vocal similarity for voice cloning
     - Supports 32 languages
   - **Alternative**: Resemble AI Chatterbox (open-source, MIT licensed, emotion control)

2. **Fine-tuned MusicGen-Eulogy (Melody Version)** via Replicate (CUSTOM - Trained on Eulogy) ✅
   - **Model**: `sundai-club/musicgen-eulogy:93ed0f8d7560876afd2a087263a4a788716c36e59de91f83130e700fedc7b2e3`
   - Fine-tuned on "Eulogy" from Stranger Things soundtrack by Kyle Dixon & Michael Stein
   - Training: 6 segments of 33s each from original Eulogy track
   - Trained with `model_version: "melody"` for melody conditioning support
   - Training URL: https://replicate.com/p/q8t41nbj0srnc0cvz48tkneaar
   - Generates music in the exact haunting, dark ambient Eulogy style
   - **Melody-conditioned**: Accepts `input_audio` parameter with `continuation: false`
   - **Output duration**: Matches the duration of the input audio

**KEY INSIGHT**: The melody model naturally produces Eulogy-style music, and when given speech audio as `input_audio`, it transforms the speech melody into that style while maintaining the same duration - creating the "almost vocal" effect we want!

### Deployment
- **Vercel** - Serverless hosting for Next.js app
- **Environment Variables** - `REPLICATE_API_TOKEN`

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                      │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Input Section:                                      │ │
│  │  - Textarea for lyrics (200-500 chars)              │ │
│  │  - "Generate" button                                │ │
│  │  - Optional mood selector (dark, eerie, melancholic)│ │
│  └──────────────────────────────────────────────────────┘ │
│  │                                                         │
│  │  Progress Section (while generating):                  │
│  │  - Step 1: Converting text to speech... ✓              │
│  │  - Step 2: Transforming to instrument... ⏳            │
│  │                                                         │
│  │  Output Section:                                        │
│  │  - Audio player (original TTS - optional debug)        │
│  │  - Audio player (final haunting instrumental)          │
│  │  - Download button                                     │
│  └─────────────────────────────────────────────────────────┘
│                           │                                 │
│                           ▼                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │      API Route: /api/generate-music                  │  │
│  │  POST { lyrics: string, mood?: string }             │  │
│  │  Returns: {                                          │  │
│  │    speechUrl: string,                               │  │
│  │    instrumentalUrl: string,                         │  │
│  │    prompt: string                                    │  │
│  │  }                                                   │  │
│  └─────────────────────────────────────────────────────┘  │
│                           │                                 │
└───────────────────────────┼─────────────────────────────────┘
                            ▼
         ┌────────────────────────────────────────┐
         │   STEP 1: Text-to-Speech (Bark)       │
         │   - Input: User's lyrics text          │
         │   - Output: Spoken audio (.wav)        │
         │   - Duration: ~5-10 seconds            │
         └────────────────┬───────────────────────┘
                          │
                          ▼
         ┌────────────────────────────────────────┐
         │   STEP 2: Melody Extraction (optional) │
         │   - Extract pitch/melody from speech   │
         │   - Or: use audio directly             │
         └────────────────┬───────────────────────┘
                          │
                          ▼
         ┌────────────────────────────────────────┐
         │   STEP 3: Vocal-to-Instrument          │
         │   (Stable Audio 2.5)                   │
         │                                        │
         │   Prompt Engineering:                  │
         │   "Transform this vocal recording into │
         │   haunting ambient synthesizer music.  │
         │   Ethereal, wordless vocal-like pads.  │
         │   Theremin-style leads. Dark cinematic │
         │   atmosphere. No drums, no percussion. │
         │   Pure ambient drone with vocal timbre │
         │   similar to Stranger Things Eulogy."  │
         │                                        │
         │   - Input: Speech audio + prompt       │
         │   - Output: Haunting instrumental      │
         └────────────────────────────────────────┘
```

## Current Status

**✅ COMPLETED**: Fine-tuned MusicGen model on Eulogy soundtrack (MELODY VERSION)
- **NEW Model ID**: `sundai-club/musicgen-eulogy:93ed0f8d7560876afd2a087263a4a788716c36e59de91f83130e700fedc7b2e3`
- Training: Retrained with `model_version: "melody"` for melody conditioning support
- Training URL: https://replicate.com/p/q8t41nbj0srnc0cvz48tkneaar
- Model accepts `input_audio` parameter with `continuation: false`
- Generated music matches the duration of input audio

**⚠️ ISSUES IDENTIFIED**:
1. Previous model version (648ae4ec3a85af8e35aa32f8b16c741686b935877dd1b7e15e9a8ca3cc19312b) does NOT support melody conditioning - causes error: "This model doesn't support melody conditioning. Use the `melody` model."
2. Bark TTS produces poor quality speech - hard to understand words, though has some musicality
3. UI is full-width instead of centered/constrained like Minimal Techno reference

**🔄 NEXT STEPS**:
1. Update to new melody model version
2. Replace Bark TTS with better model (MiniMax Speech-02-HD recommended)
3. Update UI to match Minimal Techno layout (centered, constrained width)

## Implementation Steps

### Phase 0: Fine-tune MusicGen on Eulogy ✅ COMPLETED

**Status**: ✅ DONE - Model successfully trained!

**Trained Model**: `sundai-club/musicgen-eulogy:648ae4ec3a85af8e35aa32f8b16c741686b935877dd1b7e15e9a8ca3cc19312b`

**Training Details**:
- Notebook used: `/Users/quileesimeon/sundai_01252026/qsimeon_MusicGen_Eulogy_Finetune.ipynb`
- Dataset: 6 segments × 33 seconds from original Eulogy track
- Trainer: sakemin/musicgen-fine-tuner
- Training URL: https://replicate.com/p/ceey3h3m95rne0cvz259x7074g
- Result: Model generates authentic Eulogy-style dark ambient music

**Key Features**:
- Accepts `input_audio` parameter for melody conditioning
- When given TTS speech, transforms it into Eulogy-style instrumental
- Maintains melodic contour while applying Eulogy's haunting synthesizer aesthetic

### Phase 1: Project Setup (15 mins)

1. **Initialize Next.js project:**
   ```bash
   cd /Users/quileesimeon/sundai_01252026
   npx create-next-app@latest whisper-synth --typescript --tailwind --app
   cd whisper-synth
   npm install replicate
   ```

2. **Environment setup:**
   - Create `.env.local` with `REPLICATE_API_TOKEN`
   - Add to `.gitignore`

3. **Project structure:**
   ```
   /app
     /api
       /generate-music
         route.ts          # Main orchestration endpoint
       /poll-prediction
         route.ts          # Check generation status
     /page.tsx             # Home page
     /layout.tsx           # Root layout (dark theme)
   /components
     MusicGenerator.tsx    # Main UI component
     ProgressSteps.tsx     # Multi-step progress indicator
     AudioPlayer.tsx       # Dual audio players
   /lib
     replicate-client.ts   # Replicate SDK wrapper
     prompt-engineer.ts    # Prompt creation for Step 3
     types.ts              # TypeScript types
   ```

### Phase 2: Backend - Step 1 (Text-to-Speech) (30 mins)

**File: `/lib/replicate-client.ts`**

Create reusable Replicate client wrapper:
```typescript
import Replicate from 'replicate';

export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function generateSpeech(text: string) {
  const output = await replicate.run(
    "suno-ai/bark",
    {
      input: {
        prompt: text,
        text_temp: 0.7,  // Slight variation for natural speech
        waveform_temp: 0.7,
        output_full: false  // Just audio, no video
      }
    }
  );
  return output; // Returns audio URL
}
```

**Why Bark?**
- Open-source, available on Replicate
- Can generate expressive, musical speech
- Supports emotional tones (good for haunting effect)
- Fast generation (~10 seconds)

### Phase 3: Backend - Integrate Fine-tuned MusicGen-Eulogy Model (15 mins)

**Goal**: Replace the generic MusicGen model (currently returns 404 error) with your working fine-tuned Eulogy model.

**What's Broken Right Now**:
- Line 60 in `/lib/replicate-client.ts` uses wrong model version
- Line 55 uses wrong parameter name (`melody_audio` should be `input_audio`)
- Missing required model parameters

**File: `/lib/replicate-client.ts`** - Lines 42-69

Replace the entire `generateInstrumentalMusic` function:

```typescript
export async function generateInstrumentalMusic(
  prompt: string,
  inputAudioUrl?: string  // RENAMED: was melodySpeechUrl
): Promise<any> {
  try {
    const input: any = {
      prompt: prompt,
      duration: 30,
      output_format: 'wav',  // Match training format
      continuation: false,   // Mimic melody, don't continue it
      temperature: 1,
      top_k: 250,
      top_p: 0,
      classifier_free_guidance: 3,
      normalization_strategy: 'loudness',
    }

    // CRITICAL: Parameter name changed from melody_audio to input_audio
    if (inputAudioUrl) {
      input.input_audio = inputAudioUrl  // Your TTS speech as melodic guide
    }

    const prediction = await replicate.predictions.create({
      // YOUR FINE-TUNED EULOGY MODEL:
      version: '648ae4ec3a85af8e35aa32f8b16c741686b935877dd1b7e15e9a8ca3cc19312b',
      input: input,
    })

    return prediction
  } catch (error) {
    console.error('Error generating instrumental music:', error)
    throw new Error('Failed to generate instrumental music')
  }
}
```

**What Changed**:
1. ✅ Model version → fine-tuned `sundai-club/musicgen-eulogy` (line 60)
2. ✅ Parameter: `melody_audio` → `input_audio` (line 55) - matches your model's API
3. ✅ Added model parameters from training (temperature, top_k, etc.)
4. ✅ `continuation: false` - ensures melody following, not continuation
5. ✅ `output_format: 'wav'` - matches training format

**Quick Reference - What's Changing**:

| Item | Current (Broken) | New (Working) |
|------|------------------|---------------|
| Model version | `eede8b0e7ba...` (generic, 404 error) | `648ae4ec3a...` (your Eulogy model) |
| Parameter name | `melody_audio` | `input_audio` |
| Output format | `'mp3'` | `'wav'` (matches training) |
| Parameters | Minimal | Full set (temp, top_k, etc.) |

**File: `/lib/prompt-engineer.ts`** - Simplified prompts for fine-tuned Eulogy model

Since your model is already trained on Eulogy's style, you can use simpler, more mood-focused prompts:

```typescript
interface MoodConfig {
  descriptors: string[];
  vibe: string;
}

const MOODS: Record<string, MoodConfig> = {
  dark: {
    descriptors: ['ominous', 'foreboding', 'malevolent'],
    vibe: 'intense and dramatic dark ambient'
  },
  eerie: {
    descriptors: ['unsettling', 'ghostly', 'mysterious'],
    vibe: 'subtle and creeping ethereal synthesis'
  },
  melancholic: {
    descriptors: ['sorrowful', 'wistful', 'nostalgic'],
    vibe: 'gentle and emotional dark atmosphere'
  }
};

export function createVocalToInstrumentPrompt(
  mood: string = 'eerie'
): string {
  const config = MOODS[mood] || MOODS.eerie;

  return `
Dark ambient synthesizer music in the style of Eulogy from Stranger Things.
${config.descriptors.join(', ')} atmosphere.
${config.vibe}.
Haunting ethereal pads with wordless vocal-like tones.
Pure synthesizers, no drums or percussion.
Heavy reverb and atmospheric effects.
Maintain the melodic contour and emotion of the speech.
  `.trim();
}
```

**Key improvements for fine-tuned model**:
- Shorter, more direct prompts (model already knows Eulogy style)
- Focus on mood/vibe rather than detailed instructions
- Reference "Eulogy from Stranger Things" to activate learned style
- Model will naturally preserve vocal-like quality from training data

**File: `/app/api/generate-music/route.ts`** - Line 45

Update the function call to match new parameter name:

```typescript
// OLD:
const prediction = await generateInstrumentalMusic(prompt, speechUrl)

// NEW:
const prediction = await generateInstrumentalMusic(prompt, speechUrl)
// (No change needed here - parameter name change is internal to function)
```

The API route is already correctly passing `speechUrl` as second parameter. The internal rename from `melodySpeechUrl` to `inputAudioUrl` is just for clarity.

**File: `/app/api/generate-music/route.ts`**

```typescript
import { replicate } from '@/lib/replicate-client';
import { createVocalToInstrumentPrompt } from '@/lib/prompt-engineer';

export async function POST(req: Request) {
  try {
    const { lyrics, mood = 'eerie' } = await req.json();

    // STEP 1: Generate speech from text
    const speechOutput = await replicate.run(
      "suno-ai/bark",
      {
        input: {
          prompt: lyrics,
          text_temp: 0.7,
          waveform_temp: 0.7,
        }
      }
    );

    const speechUrl = typeof speechOutput === 'string'
      ? speechOutput
      : speechOutput.audio_out;

    // STEP 2: Transform speech to haunting instrumental
    // Use Stable Audio with audio-to-audio transformation
    const prompt = createVocalToInstrumentPrompt(mood);

    const instrumentalPrediction = await replicate.predictions.create({
      version: "stability-ai/stable-audio-open-1.0-version-id",
      input: {
        prompt: prompt,
        // If Stable Audio supports audio conditioning:
        audio_file: speechUrl,  // Use speech as melodic guide
        duration: 30,  // Start with 30s for testing
        output_format: "mp3",
        cfg_scale: 7.5,
      }
    });

    // Return prediction ID for client-side polling
    return Response.json({
      predictionId: instrumentalPrediction.id,
      speechUrl: speechUrl,
      status: 'processing'
    });

  } catch (error) {
    console.error('Generation error:', error);
    return Response.json(
      { error: 'Failed to generate music' },
      { status: 500 }
    );
  }
}
```

**IMPORTANT NOTE:** Stable Audio 2.5 may NOT support audio conditioning. If not, use **MusicGen-Melody** instead:

```typescript
// Alternative using MusicGen-Melody (RECOMMENDED)
const instrumentalOutput = await replicate.run(
  "meta/musicgen-melody",
  {
    input: {
      prompt: createVocalToInstrumentPrompt(mood),
      melody_audio: speechUrl,  // Uses speech as melodic guide
      duration: 30,
      model_version: "stereo-melody-large",
      output_format: "mp3",
      normalization_strategy: "peak"
    }
  }
);
```

**File: `/app/api/poll-prediction/route.ts`**

```typescript
import { replicate } from '@/lib/replicate-client';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return Response.json({ error: 'Missing prediction ID' }, { status: 400 });
  }

  const prediction = await replicate.predictions.get(id);

  return Response.json({
    status: prediction.status,
    output: prediction.output,
    error: prediction.error
  });
}
```

### Phase 4: Frontend Component (45 mins)

**File: `/components/MusicGenerator.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { ProgressSteps } from './ProgressSteps';
import { AudioPlayer } from './AudioPlayer';

type GenerationStep = 'idle' | 'speech' | 'instrument' | 'complete';

export function MusicGenerator() {
  const [lyrics, setLyrics] = useState('');
  const [mood, setMood] = useState<'dark' | 'eerie' | 'melancholic'>('eerie');
  const [currentStep, setCurrentStep] = useState<GenerationStep>('idle');
  const [speechUrl, setSpeechUrl] = useState<string | null>(null);
  const [instrumentalUrl, setInstrumentalUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setError(null);
    setCurrentStep('speech');

    try {
      // Step 1: Call API to start generation
      const res = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lyrics, mood }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setSpeechUrl(data.speechUrl);
      setCurrentStep('instrument');

      // Step 2: Poll for instrumental completion
      const instrumentalUrl = await pollForCompletion(data.predictionId);
      setInstrumentalUrl(instrumentalUrl);
      setCurrentStep('complete');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
      setCurrentStep('idle');
    }
  }

  async function pollForCompletion(predictionId: string): Promise<string> {
    while (true) {
      const res = await fetch(`/api/poll-prediction?id=${predictionId}`);
      const data = await res.json();

      if (data.status === 'succeeded') {
        return data.output;
      } else if (data.status === 'failed') {
        throw new Error(data.error || 'Generation failed');
      }

      // Poll every 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
          Whisper Synth
        </h1>
        <p className="text-gray-400">
          Transform text into haunting, vocal-like instrumental music
        </p>
      </div>

      {/* Input Section */}
      <div className="space-y-4">
        <textarea
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          placeholder="Enter your lyrics or text..."
          className="w-full h-40 p-4 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
          maxLength={500}
        />

        <div className="flex gap-4 items-center">
          <label className="text-gray-300">Mood:</label>
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value as any)}
            className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white focus:border-purple-500 focus:outline-none"
          >
            <option value="dark">Dark & Ominous</option>
            <option value="eerie">Eerie & Ghostly</option>
            <option value="melancholic">Melancholic & Sorrowful</option>
          </select>

          <button
            onClick={handleGenerate}
            disabled={!lyrics.trim() || currentStep !== 'idle'}
            className="ml-auto px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium transition-colors"
          >
            {currentStep === 'idle' ? 'Generate' : 'Generating...'}
          </button>
        </div>
      </div>

      {/* Progress */}
      {currentStep !== 'idle' && (
        <ProgressSteps currentStep={currentStep} />
      )}

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-red-900/20 border border-red-500 text-red-400">
          {error}
        </div>
      )}

      {/* Output */}
      {instrumentalUrl && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">
            Your Haunting Instrumental
          </h2>
          <AudioPlayer url={instrumentalUrl} label="Final Instrumental" />

          {speechUrl && (
            <details className="mt-4">
              <summary className="cursor-pointer text-gray-400 hover:text-gray-300">
                Show original speech (debug)
              </summary>
              <AudioPlayer url={speechUrl} label="Original Speech" />
            </details>
          )}
        </div>
      )}
    </div>
  );
}
```

**File: `/components/ProgressSteps.tsx`**

```typescript
interface ProgressStepsProps {
  currentStep: 'speech' | 'instrument' | 'complete';
}

export function ProgressSteps({ currentStep }: ProgressStepsProps) {
  const steps = [
    { id: 'speech', label: 'Converting text to speech', icon: '🎤' },
    { id: 'instrument', label: 'Transforming to haunting instrumental', icon: '🎹' },
    { id: 'complete', label: 'Complete', icon: '✨' },
  ];

  return (
    <div className="space-y-2">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isComplete = steps.findIndex(s => s.id === currentStep) > index;

        return (
          <div
            key={step.id}
            className={`flex items-center gap-3 p-3 rounded-lg ${
              isActive ? 'bg-purple-900/30 border border-purple-500' :
              isComplete ? 'bg-green-900/20 border border-green-500' :
              'bg-gray-900 border border-gray-700'
            }`}
          >
            <span className="text-2xl">{step.icon}</span>
            <span className={`${
              isActive ? 'text-purple-300' :
              isComplete ? 'text-green-300' :
              'text-gray-400'
            }`}>
              {step.label}
            </span>
            {isActive && (
              <div className="ml-auto">
                <div className="animate-spin h-5 w-5 border-2 border-purple-500 border-t-transparent rounded-full" />
              </div>
            )}
            {isComplete && <span className="ml-auto text-green-400">✓</span>}
          </div>
        );
      })}
    </div>
  );
}
```

**File: `/components/AudioPlayer.tsx`**

```typescript
interface AudioPlayerProps {
  url: string;
  label: string;
}

export function AudioPlayer({ url, label }: AudioPlayerProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-400">{label}</label>
      <audio
        src={url}
        controls
        className="w-full"
        style={{
          filter: 'invert(0.85) hue-rotate(180deg)',
          borderRadius: '8px'
        }}
      />
      <a
        href={url}
        download
        className="inline-block text-sm text-purple-400 hover:text-purple-300"
      >
        Download ↓
      </a>
    </div>
  );
}
```

**File: `/app/page.tsx`**

```typescript
import { MusicGenerator } from '@/components/MusicGenerator';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 py-12">
      <MusicGenerator />
    </main>
  );
}
```

**File: `/app/layout.tsx`**

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Whisper Synth - Haunting Music Generator',
  description: 'Transform text into ethereal, vocal-like instrumental music',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

### Phase 5: Styling & Polish (30 mins)

**Dark Theme Configuration:**

Update `tailwind.config.ts`:
```typescript
export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          950: '#1a0a2e',
        },
      },
    },
  },
  plugins: [],
};
```

**UI Polish Checklist:**
- Dark gradient background (purple/blue tones)
- Smooth transitions on buttons and inputs
- Loading animations during generation
- Error states with helpful messages
- Responsive design (mobile-friendly)
- Accessibility (ARIA labels, keyboard navigation)

### Phase 6: Testing & Iteration with Fine-tuned Model (30 mins)

**Test Cases:**

1. **Short text (1 sentence):**
   - "Lost in the shadows, calling your name"
   - Expected: ~10 second TTS + ~20 second generation = Eulogy-style music

2. **Medium text (2-3 sentences):**
   - "The woods are dark and deep. Whispers echo through the trees. Something watches from the shadows."
   - Expected: ~15 second TTS + ~20 second generation = Haunting ambient in Eulogy style

3. **Different moods:**
   - Test all 3 mood options
   - Verify distinct variations on the Eulogy theme (dark/eerie/melancholic)
   - Listen for: similarities to original Eulogy soundtrack

4. **Edge cases:**
   - Empty text (should disable button)
   - Very short text ("Hello")
   - Maximum length (500 chars)

**Quality Assessment:**

Since you're using a fine-tuned model, results should naturally sound like Eulogy:

1. **If results sound good**:
   - Deploy to Vercel
   - Share with friends

2. **If results need tweaking**:
   - Adjust mood prompts in `/lib/prompt-engineer.ts`
   - Try different Bark voices (add voice parameter to Bark call)
   - Fine-tune the model again with more diverse descriptions

3. **To improve further**:
   - Add more training tracks (other Stranger Things soundtrack pieces)
   - Experiment with different Bark voice parameters
   - Adjust training parameters (epochs, learning rate) in fine-tuning notebook

### Phase 7: Deployment (15 mins)

1. **Prepare for deployment:**
   ```bash
   # Ensure .env.local is in .gitignore
   echo ".env.local" >> .gitignore

   # Build test
   npm run build
   ```

2. **Deploy to Vercel:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy
   vercel
   ```

3. **Set environment variables in Vercel dashboard:**
   - Go to project settings
   - Add `REPLICATE_API_TOKEN`

4. **Test production deployment:**
   - Generate test audio
   - Verify both steps complete
   - Check audio playback

## Critical Files to Create/Modify

### Must Create (Priority Order):

1. **`/lib/replicate-client.ts`** - Replicate API wrapper with TTS and music generation functions

2. **`/lib/prompt-engineer.ts`** - Prompt engineering logic for vocal-to-instrument transformation

3. **`/app/api/generate-music/route.ts`** - Main API endpoint orchestrating the two-step pipeline

4. **`/app/api/poll-prediction/route.ts`** - Endpoint for checking prediction status

5. **`/components/MusicGenerator.tsx`** - Main UI component with input, progress, and playback

6. **`/components/ProgressSteps.tsx`** - Multi-step progress indicator

7. **`/components/AudioPlayer.tsx`** - Reusable audio player component

8. **`/app/page.tsx`** - Home page integrating MusicGenerator

9. **`/app/layout.tsx`** - Root layout with dark theme

10. **`/lib/types.ts`** - TypeScript type definitions

### Must Configure:

1. **`.env.local`** - Replicate API token
2. **`tailwind.config.ts`** - Dark theme colors
3. **`next.config.js`** - Any necessary Next.js config

## Potential Challenges & Solutions

### Challenge 1: Stable Audio May Not Support Audio Conditioning

**Problem:** Stable Audio 2.5 might only accept text prompts, not audio files as input.

**Solution:** Use **MusicGen-Melody** instead - it explicitly supports melody conditioning via audio input:
```typescript
const output = await replicate.run("meta/musicgen-melody", {
  input: {
    melody_audio: speechUrl,  // Speech as melodic guide
    prompt: createVocalToInstrumentPrompt(mood),
    duration: 30,
    model_version: "stereo-melody-large"
  }
});
```

### Challenge 2: TTS Output Too Short

**Problem:** Bark might generate very short audio clips (5-10 seconds).

**Solution:**
- Chunk longer text into sentences
- Generate multiple TTS clips
- Concatenate before passing to music generation
- Or: Generate music for each chunk, then concatenate

### Challenge 3: "Almost Vocal" Quality Not Achieved

**Problem:** Output sounds like generic ambient music, not vocal-like.

**Solution - Prompt Engineering:**
```typescript
// Enhanced prompt emphasizing vocal quality
`Transform this vocal recording into synthesizer music that RETAINS
the vocal-like timbre and melodic contour. The synthesizers should
sound like:
- A choir of ghosts humming wordlessly
- A theremin player mimicking human voice
- A vocoder with extreme processing
- Someone singing through layers of fog

Keep the EXACT pitch and rhythm of the original speech but replace
the voice with haunting synthesizer tones. Think: human voice →
synthesizer, not speech → generic music.`
```

**Solution - Model Selection:**
- MusicGen-Melody is better for preserving melodic contour
- Stable Audio is better for atmospheric quality
- May need to try both and compare

### Challenge 4: Vercel Timeout (60s Hobby Plan)

**Problem:** Total generation time (TTS + music) might exceed 60 seconds.

**Solution:**
- Return prediction ID immediately
- Client polls for completion (already implemented)
- Or: Upgrade to Vercel Pro (300s timeout)
- Or: Use Replicate webhooks (more complex)

### Challenge 5: Audio Format Compatibility

**Problem:** Different models output different formats (WAV, MP3, etc.).

**Solution:**
- Request MP3 output where possible
- Use browser's native audio player (supports most formats)
- For advanced use: Convert on backend using ffmpeg (via Replicate)

## Model Selection Decision Tree

```
START: Do you need maximum "vocal-like" quality?
│
├─ YES → Use MusicGen-Melody
│   │   - Better at preserving melodic contour from speech
│   │   - Explicit melody conditioning support
│   │   - Faster generation (~30 seconds)
│   │
│   └─ Prompt: Focus on "retain vocal timbre", "follow speech melody"
│
└─ NO → Want highest atmospheric/production quality?
    │
    └─ YES → Use Stable Audio 2.5
        │   - Better audio quality (44.1kHz)
        │   - More cinematic/professional sound
        │   - Better prompt following for atmosphere
        │
        └─ Prompt: Focus on "dark ambient", "cinematic", "Stranger Things"
```

**Recommendation for MVP:** Start with **MusicGen-Melody** because:
1. Guaranteed to support audio conditioning
2. Better for "vocal-like" quality (project requirement)
3. Faster iteration cycles
4. Well-documented on Replicate

## Time Estimate Breakdown

| Phase | Task | Estimated Time |
|-------|------|----------------|
| 1 | Project setup & scaffolding | 15 mins |
| 2 | Backend - TTS implementation | 30 mins |
| 3 | Backend - Vocal-to-instrument | 45 mins |
| 4 | Frontend components | 45 mins |
| 5 | Styling & polish | 30 mins |
| 6 | Testing & iteration | 30 mins |
| 7 | Deployment | 15 mins |
| **TOTAL** | | **~3.5 hours** |

**Realistic Total:** 4-5 hours (accounting for debugging and prompt refinement)

## Success Criteria

### MVP Success (Must Have):
- ✅ User can input text (lyrics)
- ✅ Text converts to speech (audible TTS output)
- ✅ Speech transforms to instrumental music
- ✅ Instrumental has haunting, ambient quality
- ✅ Audio plays in browser
- ✅ Deployed to Vercel and shareable

### Stretch Goals (Nice to Have):
- ✅ "Almost vocal" quality is clearly recognizable
- ✅ Different moods produce noticeably different outputs
- ✅ Generation completes in under 2 minutes
- ✅ Clean, polished UI with smooth animations
- ✅ Download functionality works

### REVISED APPROACH - Fine-tuning on Eulogy:
- ✅ **Fine-tune MusicGen on Eulogy soundtrack with LoRA** (NEW PRIMARY APPROACH)
  - Download "Eulogy" from SoundCloud or YouTube
  - Chunk into 30-second segments
  - Create proper dataset with descriptions
  - Train custom model on Replicate
  - Replace generic MusicGen with fine-tuned model
  - Results: Music generated in exact Eulogy style, not generic prompting

### Future Enhancements (After Fine-tuning Works):
- Support uploading existing songs for transformation
- Multi-voice TTS (choir effect)
- Real-time waveform visualization
- User gallery of generated tracks
- Social sharing (Twitter, etc.)
- Extended duration (up to 3 minutes)
- Fine-tune additional models on other Stranger Things tracks

## Verification Plan

After integrating the fine-tuned model, test end-to-end:

### 1. Local Testing (Critical)

**Test Input**: "The shadows whisper secrets, forgotten and cold"

**Expected Flow**:
1. ✅ User enters lyrics in webapp
2. ✅ TTS generates speech (~10 seconds) - Bark working
3. ✅ Speech audio used as `input_audio` for fine-tuned model
4. ✅ Model generates Eulogy-style music (~30-60 seconds)
5. ✅ Final audio plays in browser - should sound authentically like Eulogy

**Quality Checks**:
- Does it sound like Eulogy? (dark ambient, haunting synthesizers)
- Does melody follow speech contour? (TTS melody → synth melody)
- Are there vocals or words? (should be wordless instrumental)
- Does mood selector produce different variations?

### 2. Technical Testing

**Verify API Integration**:
```bash
# Check console logs during generation:
Step 1: Generating speech from text...
Speech generated: https://replicate.delivery/...
Step 2: Generating instrumental music...
Music generation prediction created: [prediction-id]
```

**Verify Model Parameters**:
- Model version: `648ae4ec3a85af8e35aa32f8b16c741686b935877dd1b7e15e9a8ca3cc19312b`
- `input_audio` parameter correctly passed
- `continuation: false` (not continuation mode)
- `duration: 30` seconds

### 3. UI/UX Testing

- ✅ Loading states show correctly
- ✅ Progress steps animate properly
- ✅ Audio player controls work
- ✅ Download button provides valid WAV file
- ✅ Error handling displays user-friendly messages

### 4. Production Testing (After Deploy)

- ✅ Vercel deployment succeeds
- ✅ Environment variable `REPLICATE_API_TOKEN` is set
- ✅ Production URL generates music successfully
- ✅ Audio files are accessible from Replicate CDN
- ✅ No CORS errors

### Success Criteria

**Minimum Viable Product**:
- Text → TTS → Eulogy-style music pipeline works
- Output authentically sounds like Eulogy soundtrack
- Users can generate, play, and download tracks

**Stretch Goals**:
- 3 moods produce noticeably different Eulogy variations
- Generation completes in under 2 minutes
- UI is polished and responsive

## Implementation Plan - Integration Steps

### ✅ COMPLETED - Phase 0: Model Fine-tuning
- ✅ Fine-tuned MusicGen on Eulogy soundtrack
- ✅ Model: `sundai-club/musicgen-eulogy:648ae4ec3a85af8e35aa32f8b16c741686b935877dd1b7e15e9a8ca3cc19312b`
- ✅ Training successful (6 segments, 33s each)
- ✅ Model tested and working on Replicate

### 🔄 NEXT - Phase 3: Integrate Fine-tuned Model (15 mins)

**Critical Files to Update**:

1. **`/lib/replicate-client.ts`** (lines 42-69)
   - Replace `generateInstrumentalMusic` function
   - Update model version to fine-tuned Eulogy model
   - Change parameter: `melody_audio` → `input_audio`
   - Add model-specific parameters

2. **`/lib/prompt-engineer.ts`** (lines 27-54)
   - Simplify prompts (model already knows Eulogy style)
   - Update MoodConfig interface
   - Reference "Eulogy from Stranger Things" in prompts

3. **Test locally**:
   ```bash
   cd /Users/quileesimeon/sundai_01252026/whisper-synth
   npm run dev
   ```
   - Enter lyrics
   - Verify TTS generation
   - Verify Eulogy-style music generation
   - Listen for authentic Eulogy sound

4. **Deploy to Vercel**:
   ```bash
   npm run build  # Verify build succeeds
   vercel         # Deploy
   ```

## Why This Changed

**Original Plan**: Generic MusicGen + detailed prompt engineering
**Problem**: Results would be generic "dark ambient" music, not specifically Eulogy-style

**New Plan**: Fine-tuned MusicGen model trained on Eulogy soundtrack
**Benefit**: Results naturally sound like Eulogy, not just a description of it
**Result**: "Transform text into Eulogy-style music" actually works!

---

## UPDATED IMPLEMENTATION PLAN (Current)

### Three Critical Fixes Needed

#### Fix 1: Update to Melody-Conditioned MusicGen Model

**File: `/lib/replicate-client.ts`** (lines 42-80)

Replace the `generateInstrumentalMusic` function with:

```typescript
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
      duration: 30,  // Will be overridden by input_audio duration
      output_format: 'wav',
      continuation: false,  // CRITICAL: false means melody conditioning, not continuation
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
      // *** NEW MELODY-CONDITIONED MODEL ***
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
```

**What Changed**:
- Model version: `648ae4ec...` → `93ed0f8d...` (NEW melody-trained model)
- `continuation: false` explicitly set (melody conditioning mode)
- Output duration will match input audio duration automatically

#### Fix 2: Replace Bark TTS with MiniMax Speech-02-HD

**File: `/lib/replicate-client.ts`** (lines 11-40)

Replace the `generateSpeech` function with:

```typescript
export async function generateSpeech(text: string): Promise<string> {
  try {
    console.log('[REPLICATE] Calling MiniMax Speech-02-HD TTS...')
    console.log('[REPLICATE] Input text length:', text.length)

    const output = await replicate.run(
      'minimax/speech-02-hd',
      {
        input: {
          text: text,
          voice_id: 'male-qn-qingse',  // Clear, expressive male voice (can customize)
          // Other options: 'female-shaonv', 'male-yujie', etc.
          // See: https://replicate.com/minimax/speech-02-hd for all 300+ voices
        },
      }
    )

    console.log('[REPLICATE] MiniMax output received, type:', typeof output)

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
```

**What Changed**:
- Model: `suno-ai/bark` → `minimax/speech-02-hd`
- Parameters: Simplified to `text` and `voice_id`
- Quality: Industry-leading clarity and naturalness
- Result: Clear, understandable speech with musicality

**Voice Selection** (optional enhancement):
Add voice selection to UI mood selector:
- Dark mood: `'male-qn-jingying'` (deep, ominous)
- Eerie mood: `'female-shaonv'` (ethereal, ghostly)
- Melancholic mood: `'male-yujie'` (emotional, sorrowful)

#### Fix 3: Update UI to Match Minimal Techno Layout

**File: `/app/page.tsx`**

Replace entire file with:

```typescript
import { MusicGenerator } from '@/components/MusicGenerator'

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-900 text-neutral-300 p-8 md:p-16">
      <div className="max-w-2xl mx-auto">
        <MusicGenerator />
      </div>
    </main>
  )
}
```

**What Changed**:
- Added wrapper div with `max-w-2xl mx-auto` for centered, constrained width (672px max)
- Changed background from gradient to solid `bg-neutral-900`
- Added padding: `p-8 md:p-16` (mobile 2rem, desktop 4rem)
- Neutral color palette instead of gray scale

**File: `/components/MusicGenerator.tsx`**

Key changes needed (line-by-line):

**Line 115** - Remove flex centering:
```typescript
// OLD:
<div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">

// NEW:
<div className="text-neutral-300">
```

**Line 117-120** - Simplify header:
```typescript
// OLD:
<div className="text-center mb-16 mt-8">
  <h1 className="text-4xl font-light tracking-wide mb-3">Whisper Synth</h1>
  <p className="text-gray-400 text-sm font-light">Transform your words...</p>
</div>

// NEW:
<header className="mb-8">
  <h1 className="text-lg font-medium text-neutral-100 tracking-tight mb-1">Whisper Synth</h1>
  <p className="text-xs text-neutral-500">Transform your words into haunting, ethereal instrumental music</p>
</header>
```

**Line 123** - Remove max-width (handled by page.tsx wrapper):
```typescript
// OLD:
<div className="w-full max-w-2xl space-y-8">

// NEW:
<div className="space-y-6">
```

**Line 128-129** - Update label:
```typescript
// OLD:
<label className="text-xs uppercase tracking-widest text-gray-500 block">

// NEW:
<label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">
```

**Line 131-136** - Update textarea:
```typescript
// OLD:
className="w-full h-32 px-4 py-3 bg-gray-900 border border-gray-800 text-white placeholder-gray-600 focus:border-gray-700 focus:outline-none text-sm font-light resize-none"

// NEW:
className="w-full h-20 px-4 py-3 bg-neutral-800 rounded-lg text-neutral-200 placeholder-neutral-600 focus:outline-none border-none resize-none text-sm"
```

**Line 151-160** - Update select:
```typescript
// OLD:
className="w-full px-4 py-2 bg-gray-900 border border-gray-800 text-white focus:border-gray-700 focus:outline-none text-sm font-light cursor-pointer"

// NEW:
className="w-full px-4 py-3 bg-neutral-800 rounded-lg text-neutral-200 focus:outline-none border-none text-sm cursor-pointer"
```

**Line 163-169** - Update button (light style):
```typescript
// OLD:
className="px-6 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:cursor-not-allowed text-white text-sm font-light uppercase tracking-widest transition-colors"

// NEW:
className="mt-2 px-4 py-2 bg-neutral-100 text-neutral-900 text-sm font-medium rounded-lg hover:bg-white disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed transition-colors"
```

**Line 232-234** - Simplify or remove footer:
```typescript
// OLD:
<div className="mt-16 mb-8 text-center text-gray-600 text-xs font-light">
  <p>AI-powered music generation</p>
</div>

// NEW (optional):
<div className="mt-8 text-xs text-neutral-500">
  <p>AI-powered music generation</p>
</div>
```

**Summary of UI Changes**:
1. ✅ Centered, constrained layout (max-w-2xl)
2. ✅ Top-aligned instead of vertically centered
3. ✅ Neutral color palette (neutral-900, 800, 700, 500, 300, 100)
4. ✅ Rounded corners on inputs/buttons (rounded-lg)
5. ✅ Reduced spacing (space-y-6 instead of space-y-8)
6. ✅ Smaller, more compact header
7. ✅ No borders on inputs (border-none)
8. ✅ Light-colored primary button
9. ✅ Smaller text sizes throughout
10. ✅ More minimal, Minimal Techno aesthetic

### Testing Checklist

After implementing all three fixes:

1. **Test TTS Quality**:
   - Enter lyrics and generate
   - Listen to TTS output - should be clear and understandable
   - Verify musicality is maintained

2. **Test Music Generation**:
   - Verify music generation starts after TTS completes
   - Check that music duration matches TTS duration
   - Confirm Eulogy-style sound (dark ambient, synthesizers)
   - Test with different moods (dark, eerie, melancholic)

3. **Test UI Layout**:
   - Open in browser - should be centered with max 672px width
   - Check mobile responsive (padding reduces to 2rem)
   - Verify top-aligned layout (not vertically centered)
   - Confirm rounded corners on inputs/buttons
   - Check light button styling

4. **End-to-End Flow**:
   ```
   User enters lyrics → MiniMax TTS (clear speech) →
   Melody-conditioned MusicGen (Eulogy style, matching duration) →
   Audio playback → Download
   ```

### Critical Files to Update

1. `/lib/replicate-client.ts` - Two functions: `generateSpeech` and `generateInstrumentalMusic`
2. `/app/page.tsx` - Add centered wrapper div
3. `/components/MusicGenerator.tsx` - Update all styling classes
4. (Optional) `/lib/prompt-engineer.ts` - Already updated to include lyrics in prompt

### Verification

After changes, run:
```bash
cd /Users/quileesimeon/sundai_01252026/whisper-synth
npm run dev
```

Open http://localhost:3000 and test:
1. Layout should be centered and constrained
2. Enter test lyrics: "The shadows whisper secrets, forgotten and cold"
3. Check console logs for detailed progress
4. Verify clear TTS speech quality
5. Confirm music generation with melody conditioning
6. Listen to final output - should be Eulogy-style, matching TTS duration
