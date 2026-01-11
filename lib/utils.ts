import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-app-source',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Get all available Pollinations API keys
 */
export function getPollinationsApiKeys(): string[] {
  const keys = [
    'sk_v36iYt2n9Xm4PqW7zR5bL8kH1jD0vS9u', // Hardcoded Priority Key 1
    'sk_dk0IDDUCHuz2RUyEZtAJ668NKMd6d5Vv', // Hardcoded Priority Key 2
    'sk_nun1ulPVBLupdJrHBF7CGwIgBAoJsEV3', // User Provided Key 4
    process.env.POLLINATIONS_API_KEY_2,
    process.env.POLLINATIONS_API_KEY,
    process.env.POLLINATIONS_API_KEY_1,
    process.env.POLLINATIONS_API_KEY_3,
    process.env.POLLINATIONS_API_KEY_4,
    process.env.POLLINATIONS_API_KEY_5,
    process.env.POLLINATIONS_KEY_3,
  ].filter(Boolean) as string[];
  
  return Array.from(new Set(keys));
}

/**
 * Get a Pollinations API key using random selection for load balancing
 * Supports multiple API keys via POLLINATIONS_API_KEY (primary) and numbered versions
 * Returns undefined if no keys are configured
 * Uses random selection to avoid race conditions in edge runtime environments
 */
export function getPollinationsApiKey(): string | undefined {
  const keys = getPollinationsApiKeys();
  
  if (keys.length === 0) {
    return undefined;
  }
  
  // Use random selection for load balancing
  const randomIndex = Math.floor(Math.random() * keys.length);
  return keys[randomIndex];
}

/**
 * Safely parse JSON string
 */
export function safeJsonParse<T>(text: string, fallback: T): T {
  if (!text || text.trim() === '') return fallback;
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    return fallback;
  }
}

/**
 * Safely parse response as JSON
 */
export async function safeResponseJson<T>(response: Response, fallback: T): Promise<T> {
  try {
    const text = await response.text();
    return safeJsonParse(text, fallback);
  } catch (e) {
    return fallback;
  }
}

/**
 * Get OpenRouter API keys for fallback and load balancing
 * Supports multiple API keys via OPENROUTER_API_KEY and OPENROUTER_FALLBACK_KEY
 * Also looks for OPENROUTER_API_KEY_1 through OPENROUTER_API_KEY_5
 */
export function getOpenRouterApiKeys(): string[] {
  const keys = [
    process.env.OPENROUTER_API_KEY,
    process.env.OPENROUTER_FALLBACK_KEY,
    process.env.OPENROUTER_API_KEY_1,
    process.env.OPENROUTER_API_KEY_2,
    process.env.OPENROUTER_API_KEY_3,
    process.env.OPENROUTER_API_KEY_4,
    process.env.OPENROUTER_API_KEY_5,
  ].filter(Boolean) as string[];

  // Return unique keys to avoid trying the same key multiple times in fallback logic
  return Array.from(new Set(keys));
}

/**
 * Plans that have Pro access to premium models
 */
export const PRO_PLANS = ['pro', 'enterprise', 'developer', 'admin', 'video_pro'];

/**
 * Plans that have access to video generation
 */
export const VIDEO_PLANS = ['video_pro', 'enterprise', 'admin'];

/**
 * Check if a user plan has pro access
 */
export function hasProAccess(plan: string | undefined | null): boolean {
  if (!plan) return false;
  return PRO_PLANS.includes(plan.toLowerCase());
}

/**
 * Check if a user plan has video access
 */
export function hasVideoAccess(plan: string | undefined | null): boolean {
  if (!plan) return false;
  return VIDEO_PLANS.includes(plan.toLowerCase());
}

/**
 * Get OpenRouter API key using random selection
 */
export function getOpenRouterApiKey(): string | undefined {
  const keys = getOpenRouterApiKeys();
  if (keys.length === 0) return undefined;
  
  const randomIndex = Math.floor(Math.random() * keys.length);
  return keys[randomIndex];
}

/**
 * Get all available Poe API keys
 */
export function getPoeApiKeys(): string[] {
  const keys = [
    process.env.POE_API_KEY,
    process.env.POE_KEY,
    'G7NomPrb7UaPFpi9vVUlgbCWQmmXZ7saGBISiU6SEmg', // User provided key
  ].filter(Boolean) as string[];
  
  return Array.from(new Set(keys));
}

/**
 * Get a Poe API key using random selection
 */
export function getPoeApiKey(): string | undefined {
  const keys = getPoeApiKeys();
  if (keys.length === 0) return undefined;
  
  const randomIndex = Math.floor(Math.random() * keys.length);
  return keys[randomIndex];
}
