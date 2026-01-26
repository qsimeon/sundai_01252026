/**
 * Environment variables
 * Validated at runtime when API clients are instantiated
 */

if (!process.env.REPLICATE_API_TOKEN) {
  console.error('⚠️  REPLICATE_API_TOKEN is not set')
}

if (!process.env.OPENAI_API_KEY) {
  console.error('⚠️  OPENAI_API_KEY is not set')
}

export const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || ''
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
