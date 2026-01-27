/**
 * Environment variables
 * Validated at runtime when API clients are instantiated
 */

if (!process.env.REPLICATE_API_TOKEN) {
  console.error('⚠️  REPLICATE_API_TOKEN is not set')
}

export const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || ''
