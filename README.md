# Whisper Synth

**Transform your words into haunting, ethereal instrumental music inspired by the Stranger Things "Eulogy" soundtrack.**

Whisper Synth combines text-to-music generation with a custom fine-tuned MusicGen model to create dark, atmospheric music that captures the eerie, mysterious aesthetic of the Eulogy song.

---

## Table of Contents

- [Project Overview](#project-overview)
- [System Architecture](#system-architecture)
- [The Complete Process](#the-complete-process)
  - [Phase 1: Dataset Preparation](#phase-1-dataset-preparation)
  - [Phase 2: Model Fine-tuning](#phase-2-model-fine-tuning)
  - [Phase 3: Web Application](#phase-3-web-application)
- [Quick Start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [Running the Webapp Locally](#running-the-webapp-locally)
  - [Using the Application](#using-the-application)
- [Deployment](#deployment)
  - [Deploy to Vercel](#deploy-to-vercel)
- [Project Structure](#project-structure)
- [Technical Stack](#technical-stack)
- [Key Features](#key-features)
- [Troubleshooting](#troubleshooting)

---

## Project Overview

Whisper Synth is a web application that leverages fine-tuned machine learning models to create emotionally evocative instrumental music from text input. Rather than attempting complex voice synthesis, the application uses a direct text-to-music approach with a custom-trained model based on Meta's MusicGen.

### The Vision

The goal was to capture the unique dark, ethereal aesthetic of "Eulogy" from the Stranger Things soundtrack—a song characterized by:
- Haunting synthesizers with vocal-like tones
- Ambient, cinematic atmosphere
- No percussion, pure synthesized sound
- Heavy reverb and atmospheric effects

By fine-tuning MusicGen on a custom dataset derived from Eulogy, we created a specialized model that generates music in this specific style when given text descriptions.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Browser                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        React Component (MusicGenerator.tsx)          │   │
│  │  • Input: Lyrics (text) + Atmosphere (mood)         │   │
│  │  • Pre-validates with Zod schemas                   │   │
│  │  • Handles loading states & errors                  │   │
│  └──────────────────────────┬───────────────────────────┘   │
└─────────────────────────────┼─────────────────────────────────┘
                              │
                    HTTP POST /api/generate-music
                    Body: { lyrics, mood }
                              │
┌─────────────────────────────┼─────────────────────────────────┐
│        Next.js API Route (/app/api/generate-music/route.ts)  │
│  ┌──────────────────────────┴───────────────────────────────┐ │
│  │  1. Validate input with Zod schemas                      │ │
│  │  2. Transform lyrics → music prompt (prompt-engineer)   │ │
│  │  3. Call Replicate API (MusicGen-Eulogy)                │ │
│  │  4. Wait for prediction completion                      │ │
│  │  5. Return audio URL or processing status               │ │
│  └──────────────────────────┬───────────────────────────────┘ │
└─────────────────────────────┼─────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
    ┌─────────────────────┐      ┌──────────────────────────┐
    │  Replicate API      │      │  Poll Endpoint           │
    │  ┌─────────────────┐│      │  /api/poll-prediction    │
    │  │ MusicGen Eulogy ││      │  (if async)              │
    │  │ Fine-tuned      ││      └──────────────────────────┘
    │  │ Model Version   ││
    │  │ 93ed0f8d7560... ││
    │  └─────────────────┘│
    │                     │
    │  Generates MP3 or   │
    │  WAV file (10 sec)  │
    └─────────────────────┘
                │
                ▼
    ┌─────────────────────┐
    │  Replicate Storage  │
    │  (Signed URL)       │
    └─────────────────────┘
                │
                ▼
    ┌─────────────────────┐
    │  Return to Client   │
    │  Audio URL          │
    └─────────────────────┘
                │
                ▼
    ┌─────────────────────┐
    │  Browser Audio Tag  │
    │  Play & Download    │
    └─────────────────────┘
```

### Data Flow

1. **User Input**: User enters lyrics and selects an atmosphere (dark, eerie, melancholic)
2. **Client Validation**: React component pre-validates input using Zod schemas
3. **API Request**: Sends POST request to `/api/generate-music`
4. **Server Validation**: API route validates request and response with Zod schemas
5. **Prompt Engineering**: Lyrics + mood are transformed into a detailed MusicGen prompt
6. **Model Inference**: Replicate API calls fine-tuned MusicGen-Eulogy model
7. **Audio Generation**: Model generates 10-second instrumental audio file
8. **Response**: API returns signed URL to generated audio
9. **Playback**: Browser renders audio player for playback and download

---

## The Complete Process

This project required significant preparation before the web application could function. Below is the complete end-to-end process we followed.

### Phase 1: Dataset Preparation

**Objective**: Create a training dataset that captures the Eulogy aesthetic

#### Step 1.1: Source Material
- **Original Audio**: `eulogy.mp3` (3:34, approximately 3.5MB)
- **Original Artist**: Kyle Dixon & Michael Stein (Stranger Things Soundtrack)
- **Goal**: Extract segments to create training examples

#### Step 1.2: Segmentation & Processing
The training process required:

1. **Audio Segmentation**
   - Split the 3+ minute Eulogy track into overlapping 10-30 second segments
   - Each segment preserves the unique harmonic and atmospheric characteristics
   - Segments are saved as individual audio files (MP3/WAV format)

2. **Metadata Creation**
   - Each audio segment paired with text description (caption)
   - Descriptions capture the essence: dark, eerie, haunting, ethereal
   - Example captions:
     - "Haunting synthesizers with ethereal vocal-like tones, heavy reverb, dark ambient atmosphere"
     - "Slow, unsettling ghostly synthesizers, cinematic and deeply atmospheric"
     - "Dark ominous ambient music, foreboding synthesizer tones, no drums"

3. **Dataset Assembly**
   - Created `eulogy_dataset.zip` containing:
     - Audio files (10-30 second segments)
     - Metadata CSV with audio filename → description mapping
     - Cover art (`eulogy_cover_art.jpeg`) for reference

#### Dataset Structure
```
eulogy_dataset.zip
├── audio_files/
│   ├── eulogy_segment_001.mp3
│   ├── eulogy_segment_002.mp3
│   ├── eulogy_segment_003.mp3
│   └── ... (20+ segments total)
├── metadata.csv
│   └── filename, description (2 columns)
└── cover_art.jpeg
```

**Key Decision**: Rather than including voice or lyrics in training data, we focused purely on the instrumental synthesizer characteristics and atmospheric qualities.

### Phase 2: Model Fine-tuning

**Objective**: Fine-tune Meta's MusicGen model to generate music in the Eulogy style

#### Step 2.1: Replicate Setup
- Created account on Replicate (https://replicate.com)
- Selected MusicGen as base model
- Prepared to launch fine-tuning job

#### Step 2.2: Fine-tuning Process
The actual fine-tuning was executed in **Jupyter notebook** (`qsimeon_MusicGen_Eulogy_Finetune.ipynb`):

**Process Overview**:
1. **Upload Dataset**: Upload `eulogy_dataset.zip` to Replicate
2. **Configure Training**:
   - Base model: Meta's MusicGen (30B parameters)
   - Learning rate: Suitable for instruction tuning
   - Epochs: 3-5 (balance between overfitting and underfitting)
   - Batch size: Small (GPU memory constraints)
3. **Launch Training**: Submit training job on Replicate infrastructure
4. **Monitor Progress**: Track loss curves and generated samples
5. **Capture Model Version**: Once complete, note the fine-tuned version ID
   - **Version ID**: `93ed0f8d7560876afd2a087263a4a788716c36e59de91f83130e700fedc7b2e3`
   - This is the "MusicGen-Eulogy" model used by the webapp

#### Step 2.3: Validation
After fine-tuning, the model was validated by:
- Testing with sample text prompts
- Verifying output maintains Eulogy's dark, ethereal aesthetic
- Confirming consistent 10-second generation length
- Checking output audio quality (MP3/WAV formats)

**Key Result**: The fine-tuned model learned to:
- Prioritize synthesizer tones over percussion
- Generate haunting, ethereal sounds
- Maintain consistent mood based on input descriptors
- Produce 10-second audio segments suitable for web playback

### Phase 3: Web Application

**Objective**: Create a user-friendly interface for the fine-tuned model

#### Step 3.1: Architecture Decision
- **Framework**: Next.js (React + API routes in same project)
- **Type Safety**: TypeScript with Zod schema validation
- **Styling**: Tailwind CSS for minimal dark aesthetic
- **API Client**: Replicate's official npm package

#### Step 3.2: Key Components

**Frontend** (`components/MusicGenerator.tsx`):
- React component with controlled inputs
- Textarea for lyrics (max 500 chars)
- Dropdown for mood selection (dark, eerie, melancholic)
- Async handling with loading states
- AudioPlayer component for playback

**API Route** (`app/api/generate-music/route.ts`):
- Validates input with `GenerationRequestSchema`
- Transforms lyrics to MusicGen prompt with `createVocalToInstrumentPrompt()`
- Calls Replicate with fine-tuned model version
- Validates response with schemas
- Returns audio URL or processing status

**Prompt Engineering** (`lib/prompt-engineer.ts`):
- Maps mood to descriptors (dark, eerie, melancholic)
- Constructs detailed prompts for MusicGen
- Ensures consistent style across all generations
- Example output:
  ```
  Eulogy-style dark ambient music inspired by: "Once upon a time in a forgotten land"

  unsettling, ghostly, ethereal, haunting atmosphere.
  Haunting synthesizers with ethereal vocal-like tones.
  Heavy reverb, no drums, pure atmospheric synthesis.
  Subtle and creeping emotional progression.
  Style: Dark ambient, cinematic, haunting from Stranger Things.
  ```

**Validation** (`lib/schemas.ts`):
- Zod schemas for all boundaries (input, output, external API)
- Type-safe validation at runtime
- Clear error messages for users

#### Step 3.3: Deployment Target
- Vercel (serverless platform optimized for Next.js)
- Environment variables: `REPLICATE_API_TOKEN`
- Automatic scaling and CDN delivery

---

## Quick Start

### Prerequisites

**For running locally:**
- Node.js 18+ and npm
- Replicate account with API token
- Git

**For deployment:**
- Vercel account (free tier available)
- GitHub account (for easy Vercel integration)

### Running the Webapp Locally

1. **Clone the repository** (if starting from scratch):
   ```bash
   git clone <repository-url>
   cd sundai_01252026
   ```

2. **Navigate to the webapp**:
   ```bash
   cd whisper-synth
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set environment variables**:
   Create `.env.local` file in the `whisper-synth` directory:
   ```env
   REPLICATE_API_TOKEN=r8_your_token_here
   ```

   Get your Replicate API token from: https://replicate.com/account/api-tokens

5. **Start development server**:
   ```bash
   npm run dev
   ```

6. **Open in browser**:
   Navigate to `http://localhost:3000`

### Using the Application

1. **Enter Text**: Type lyrics, poetry, or any text in the textarea (max 500 characters)
2. **Select Mood**: Choose the atmosphere for the generated music:
   - **Dark & Ominous**: Intense, foreboding, shadowy (50-60 BPM)
   - **Eerie & Ghostly**: Unsettling, ethereal, haunting (60-70 BPM)
   - **Melancholic & Sorrowful**: Wistful, nostalgic, bittersweet (70-80 BPM)
3. **Generate**: Click the "Generate" button
4. **Wait**: The model will generate a 10-second instrumental (typically 15-30 seconds total)
5. **Listen**: Audio player appears automatically
6. **Download**: Click download button to save the generated audio file
7. **Create Another**: Click to generate new music with different text/mood

**Expected Output**:
- 10-second MP3/WAV audio file
- Dark ambient synthesis with ethereal, vocal-like tones
- Heavy reverb and atmospheric effects
- No drums or percussion

---

## Deployment

### Deploy to Vercel

Vercel is the easiest platform to deploy Next.js applications with one-click setup.

#### Option 1: From GitHub (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select your GitHub repository
   - Choose the `whisper-synth` directory as the root:
     - In "Root Directory" field, enter: `whisper-synth`

3. **Configure Environment Variables**:
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add variable:
     - **Name**: `REPLICATE_API_TOKEN`
     - **Value**: Your Replicate API token
     - **Environments**: Select all (Production, Preview, Development)

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your app is live at `https://your-project.vercel.app`

#### Option 2: From CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   cd whisper-synth
   vercel
   ```

3. **Follow prompts**:
   - Link to Vercel account
   - Choose project name
   - Confirm settings
   - Add environment variables when prompted
   - Build and deploy

4. **Access your app**:
   Vercel will provide a URL like `https://whisper-synth-xxx.vercel.app`

#### Post-Deployment Configuration

After deployment, you may want to:

1. **Add Custom Domain**:
   - In Vercel dashboard, go to Settings → Domains
   - Add your custom domain
   - Configure DNS records (instructions provided)

2. **Monitor Function Invocations**:
   - Vercel automatically tracks API route performance
   - Check Analytics → Functions to see call patterns

3. **Set Up Logging**:
   - Vercel provides logs in Deployments tab
   - Check for any errors in real-time

4. **Configure Team/Production Settings**:
   - Add team members if collaborating
   - Set up staging environment if needed

---

## Project Structure

```
sundai_01252026/
├── README.md                          # This file
├── PLAN.md                            # Implementation plan & architecture details
├── .git/                              # Git repository
│
├── eulogy.mp3                         # Original Eulogy song (source material)
├── eulogy_dataset.zip                 # Training dataset (audio + metadata)
├── eulogy_cover_art.jpeg              # Cover art reference
├── qsimeon_MusicGen_Eulogy_Finetune.ipynb  # Jupyter notebook for fine-tuning
│
└── whisper-synth/                     # Next.js Web Application
    ├── app/
    │   ├── layout.tsx                 # Root layout wrapper
    │   ├── page.tsx                   # Home page
    │   ├── globals.css                # Global styles
    │   └── api/
    │       ├── generate-music/
    │       │   └── route.ts           # Main API endpoint
    │       └── poll-prediction/
    │           └── route.ts           # Polling endpoint (if async)
    │
    ├── components/
    │   ├── MusicGenerator.tsx         # Main UI component
    │   └── AudioPlayer.tsx            # Audio playback component
    │
    ├── lib/
    │   ├── schemas.ts                 # Zod validation schemas
    │   ├── errors.ts                  # Error classes & formatting
    │   ├── env.ts                     # Environment variable setup
    │   ├── replicate-client.ts        # Replicate API integration
    │   └── prompt-engineer.ts         # Mood-based prompt generation
    │
    ├── package.json                   # Dependencies & scripts
    ├── tsconfig.json                  # TypeScript configuration
    ├── tailwind.config.ts             # Tailwind CSS configuration
    ├── next.config.js                 # Next.js configuration
    └── .env.local                     # Environment variables (local only)
```

### File Descriptions

**Root Level Files**:
- `eulogy.mp3`: Original song for reference and dataset source
- `eulogy_dataset.zip`: Contains segmented audio + descriptions used for model training
- `eulogy_cover_art.jpeg`: Visual reference for the Eulogy aesthetic
- `qsimeon_MusicGen_Eulogy_Finetune.ipynb`: Complete fine-tuning workflow (can be re-run if needed)

**Web Application Files**:
- `app/api/generate-music/route.ts`: Orchestrates text → prompt → model → audio URL
- `lib/schemas.ts`: 5-layer schema design (primitives → domains → contracts → external APIs → app types)
- `lib/replicate-client.ts`: Replicate SDK wrapper with validation
- `lib/prompt-engineer.ts`: Transforms mood + text into MusicGen prompts
- `components/MusicGenerator.tsx`: Complete React component with form, loading, and audio player

---

## Technical Stack

### Backend/Infrastructure
- **Framework**: Next.js 14+ (React + Node.js API routes)
- **Runtime**: Node.js (serverless functions on Vercel)
- **Type System**: TypeScript with strict mode
- **Validation**: Zod (runtime schema validation)
- **External APIs**: Replicate (for MusicGen inference)

### Frontend
- **UI Framework**: React 18+ (via Next.js)
- **Styling**: Tailwind CSS (utility-first CSS framework)
- **Type System**: TypeScript
- **HTTP Client**: Fetch API (native browser)

### Deployment
- **Hosting**: Vercel (serverless platform)
- **CDN**: Vercel Edge Network (global distribution)
- **Monitoring**: Built-in Vercel Analytics

### Model
- **Base Model**: Meta MusicGen (30B parameters)
- **Fine-tuning**: Custom Eulogy dataset
- **Inference Platform**: Replicate (https://replicate.com)
- **Model Version**: `93ed0f8d7560876afd2a087263a4a788716c36e59de91f83130e700fedc7b2e3`

### Development Tools
- **Package Manager**: npm
- **Build Tool**: Next.js (webpack)
- **Linting**: Built-in Next.js linting
- **Testing**: Jest (can be configured)

---

## Key Features

### ✓ Text-to-Music Generation
Convert written text into atmospheric instrumental music using a fine-tuned MusicGen model.

### ✓ Mood Selection
Three mood options control the style of generated music:
- Dark & Ominous (intense, foreboding)
- Eerie & Ghostly (unsettling, ethereal)
- Melancholic & Sorrowful (wistful, nostalgic)

### ✓ Type-Safe API
Every API boundary validated with Zod schemas:
- Input validation (user text + mood)
- Output validation (audio URL)
- External API validation (Replicate responses)
- Error standardization (consistent error responses)

### ✓ Client-Side Validation
Form validation before network request:
- Text length limits (max 500 characters)
- Empty input prevention
- Real-time character count
- User-friendly error messages

### ✓ Dark, Minimal UI
- Neutral color palette (grays on dark background)
- Minimal interface (focus on content)
- Responsive design (mobile & desktop)
- Accessibility-first styling

### ✓ Audio Playback & Download
- Built-in HTML5 audio player
- Play, pause, seek controls
- Download button for saving audio files
- Waveform visualization (if browser supports it)

### ✓ Scalable Serverless Architecture
- Auto-scaling API routes (Vercel)
- No infrastructure management
- Pay-per-use pricing model
- Global CDN distribution

---

## Troubleshooting

### Common Issues

#### 1. "Invalid environment variable: REPLICATE_API_TOKEN"
**Problem**: API token not set or incorrectly formatted
**Solution**:
- Verify token starts with `r8_`
- Check `.env.local` file exists in `whisper-synth` directory
- Restart dev server after updating `.env.local`
- For Vercel: Check Environment Variables in Settings tab

#### 2. "Generation failed - API returned 422"
**Problem**: Invalid request to Replicate API
**Solution**:
- Verify model version ID is correct
- Check prompt length (shouldn't exceed typical MusicGen limits)
- Ensure input parameters match schema definitions
- Check Replicate dashboard for rate limits

#### 3. "Audio player doesn't load"
**Problem**: CORS issue or invalid audio URL
**Solution**:
- Check browser console for CORS errors
- Verify Replicate returned a valid signed URL
- Test URL directly in browser to confirm access
- Check network tab in DevTools for 403/404 errors

#### 4. "Build fails on Vercel with TypeScript errors"
**Problem**: Type mismatches in production build
**Solution**:
- Run `npm run build` locally to catch errors first
- Check TypeScript strict mode is enabled
- Verify all imports use correct paths
- Review recent file changes for type issues

#### 5. "Slow generation time (>60 seconds)"
**Problem**: Model is slow or overloaded
**Solution**:
- Check Replicate queue status (may be busy)
- Verify input prompt isn't too complex
- Try again in a few minutes
- Check Replicate's status page for outages

#### 6. "Generated audio is always the same length"
**Problem**: Fixed 10-second duration is applied
**Solution**:
- This is by design for consistency
- If you want variable duration, modify `getFixedDuration()` in `replicate-client.ts`
- Be aware that longer durations increase generation time and cost

#### 7. "502 Bad Gateway on Vercel"
**Problem**: API route error or timeout
**Solution**:
- Check function logs in Vercel dashboard
- Verify Replicate API token is valid
- Check if Replicate API is experiencing issues
- Review error response from Replicate in logs

### Debug Mode

To enable detailed logging:

1. **Client-side**: Check browser console (DevTools → Console tab)
   - All API calls are logged with `[CLIENT]` prefix
   - Responses and errors are printed

2. **Server-side**: Check Vercel logs
   - Go to Vercel dashboard → Deployments → Function logs
   - Filter by `/api/generate-music` route
   - Look for `[API]`, `[REPLICATE]` prefixed logs

3. **Replicate**: Check model predictions
   - Go to https://replicate.com/account/predictions
   - View latest predictions and their status
   - Check error messages if prediction failed

---

## Next Steps & Future Enhancements

### Immediate (Post-Launch)
- [ ] Monitor Vercel function metrics
- [ ] Collect user feedback
- [ ] Track generation success rate

### Short-term (1-2 weeks)
- [ ] Add more mood options
- [ ] Implement audio generation history (saved locally)
- [ ] Add sharing functionality (generate shareable links)
- [ ] Optimize prompt engineering for better outputs

### Medium-term (1-2 months)
- [ ] Multi-language support for prompts
- [ ] User accounts (save favorite generations)
- [ ] Advanced controls (BPM, instrument selection)
- [ ] API documentation for third-party integration

### Long-term (3+ months)
- [ ] Re-train model with larger dataset
- [ ] Support for custom model uploads
- [ ] Analytics dashboard (track most popular moods/text)
- [ ] Mobile app (React Native)

---

## Contributing

This project documents a complete end-to-end workflow for fine-tuning and deploying music generation models.

If you want to:
- **Re-train the model**: Use `qsimeon_MusicGen_Eulogy_Finetune.ipynb` with a new dataset
- **Modify the web app**: Edit files in `whisper-synth/` directory
- **Change the model**: Update version ID in `lib/replicate-client.ts` line 54
- **Deploy changes**: Push to GitHub and Vercel auto-deploys

---

## License

This project is for educational and personal use.

**Original Work Attribution**:
- "Eulogy" by Kyle Dixon & Michael Stein (Stranger Things Soundtrack)
- MusicGen model by Meta
- Fine-tuning and web application by Quilee Simeon

---

## Contact & Support

For questions about:
- **The webapp**: Check troubleshooting section above
- **Fine-tuning process**: See `qsimeon_MusicGen_Eulogy_Finetune.ipynb` and PLAN.md
- **Deployment**: See deployment section or Vercel documentation
- **Replicate API**: See https://replicate.com/docs

---

## Appendix: Key Implementation Details

### Schema Validation Pattern

All API boundaries follow a 5-layer schema design:

```
Layer 1: Atomic Primitives
├── MoodSchema (enum: dark, eerie, melancholic)
├── LyricsSchema (string, 1-500 chars)
└── PredictionIdSchema (non-empty string)

Layer 2: Composite Domain Types
├── GenerationRequestSchema { lyrics, mood }
└── PollQueryParamsSchema { id }

Layer 3: API Contracts
├── GenerationResponseSchema (union of processing/completed)
└── PredictionResultSchema { status, output, error }

Layer 4: Replicate API Types
├── MusicGenInputSchema (all model parameters)
└── MusicGenPredictionSchema (API response)

Layer 5: Application Types
└── TypeScript types via z.infer<>
```

### Error Handling Hierarchy

```
Error (built-in)
└── AppError (base class)
    ├── ValidationError (input validation failed)
    │   └── field-level errors from Zod
    ├── ReplicateError (external API failed)
    │   └── HTTP status code + details
    └── ApiError (internal server error)
        └── formatted error response
```

### Mood-Based Prompt Engineering

Each mood generates specific prompts:

**Dark & Ominous**:
```
Descriptors: ominous, foreboding, shadowy, malevolent
Tempo: very slow (50-60 BPM)
Intensity: intense and dramatic
```

**Eerie & Ghostly**:
```
Descriptors: unsettling, ghostly, ethereal, haunting
Tempo: slow (60-70 BPM)
Intensity: subtle and creeping
```

**Melancholic & Sorrowful**:
```
Descriptors: sorrowful, wistful, nostalgic, bittersweet
Tempo: slow to medium (70-80 BPM)
Intensity: gentle and emotional
```

---

Generated: January 2026
Version: 1.0
