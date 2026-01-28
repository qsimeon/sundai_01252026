import { z } from 'zod'

/**
 * LAYER 1: Atomic Primitives
 * Individual building blocks for all domain types
 */

export const MoodSchema = z
  .enum(['dark', 'eerie', 'melancholic'])
  .describe('Mood/tone for generated music')

export type Mood = z.infer<typeof MoodSchema>



export const PredictionIdSchema = z
  .string()
  .min(1, 'Prediction ID cannot be empty')
  .describe('Unique identifier for Replicate prediction')

export type PredictionId = z.infer<typeof PredictionIdSchema>

export const LyricsSchema = z
  .string()
  .min(1, 'Lyrics cannot be empty')
  .max(500, 'Lyrics must be less than 500 characters')
  .transform((s) => s.trim())
  .describe('Song lyrics input (1-500 characters)')

export type Lyrics = z.infer<typeof LyricsSchema>

// Prediction status enum - used by both TTS and MusicGen predictions
const PredictionStatusEnum = z.enum([
  'starting',
  'processing',
  'succeeded',
  'failed',
  'canceled',
])

/**
 * LAYER 2: Composite Domain Types
 * Domain-specific types combining primitives
 */

export const GenerationRequestSchema = z.object({
  lyrics: LyricsSchema,
  mood: MoodSchema.optional().default('eerie'),
})

export type GenerationRequest = z.infer<typeof GenerationRequestSchema>

export const PollQueryParamsSchema = z.object({
  id: PredictionIdSchema,
})

export type PollQueryParams = z.infer<typeof PollQueryParamsSchema>

/**
 * LAYER 3: API Contracts
 * Request/response schemas for our APIs
 */

export const GenerationResponseSchema = z.union([
  z.object({
    predictionId: PredictionIdSchema,
    status: z.literal('processing'),
  }),
  z.object({
    predictionId: PredictionIdSchema,
    status: z.literal('completed'),
    instrumentalUrl: z.string().nullable(),
  })
])

export type GenerationResponse = z.infer<typeof GenerationResponseSchema>

export const PredictionResultSchema = z.object({
  status: PredictionStatusEnum,
  output: z.union([z.string(), z.array(z.string())]).nullable(),
  error: z.string().nullable(),
})

export type PredictionResult = z.infer<typeof PredictionResultSchema>

export const ErrorResponseSchema = z.object({
  error: z.string().describe('Error message'),
  code: z
    .enum(['VALIDATION_ERROR', 'REPLICATE_ERROR', 'INTERNAL_ERROR'])
    .describe('Error code for client handling'),
  fieldErrors: z
    .record(z.string(), z.array(z.string()))
    .optional()
    .describe('Field-level validation errors'),
})

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>

/**
 * LAYER 4: Replicate API Types
 * Schemas for Replicate API request/response handling
 */

/**
 * Replicate FileOutput object
 * Returned by models that output files (audio, images, etc.)
 */
export const FileOutputSchema = z.object({
  url: z.string().min(1).describe('Direct URL to the output file'),
  mime_type: z.string().optional().describe('MIME type of the file'),
  size: z.number().optional().describe('File size in bytes'),
})

export type FileOutput = z.infer<typeof FileOutputSchema>



/**
 * Generic Replicate output (for music/other outputs that might be different format)
 */
export const ReplicateRawOutputSchema = z
  .unknown()
  .describe('Unknown Replicate output - will be validated by specific handlers')

export type ReplicateRawOutput = z.infer<typeof ReplicateRawOutputSchema>



export const MusicGenInputSchema = z.object({
  prompt: z.string().min(1),
  duration: z.number().min(1).max(300),
  output_format: z.enum(['wav', 'mp3']),
  continuation: z.boolean().optional(),
  model: z.string().optional(),
  temperature: z.number().optional(),
  top_k: z.number().optional(),
  top_p: z.number().optional(),
  classifier_free_guidance: z.number().optional(),
  conditioning_length: z.number().optional(),
  normalization_factor: z.number().optional(),
})

export type MusicGenInput = z.infer<typeof MusicGenInputSchema>

export const MusicGenPredictionSchema = z.object({
  id: PredictionIdSchema,
  status: PredictionStatusEnum,
  output: z.union([z.null(), z.string(), z.array(z.string())]),
  error: z.string().nullable(),
})

export type MusicGenPrediction = z.infer<typeof MusicGenPredictionSchema>

