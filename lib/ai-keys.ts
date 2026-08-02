// Load API Keys from environment variable for infinite rotation
// Expects a comma-separated list of keys
const getApiKeys = () => {
  const keysEnv = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
  return keysEnv.split(',').map(k => k.trim()).filter(Boolean);
};

let currentIndex = 0;

/**
 * Returns the next API key in the round-robin pool.
 */
export function getNextApiKey(): string {
  const keys = getApiKeys();
  if (keys.length === 0) {
    throw new Error("No GEMINI_API_KEYS found in environment variables.");
  }
  
  const key = keys[currentIndex % keys.length];
  currentIndex = (currentIndex + 1) % keys.length;
  return key;
}

/**
 * Executes a function that uses the Google Gen AI API, automatically retrying 
 * with the next key if a Rate Limit (429) or related error occurs.
 */
export async function withKeyRotation<T>(
  apiCall: (apiKey: string) => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    const key = getNextApiKey();
    try {
      return await apiCall(key);
    } catch (error: any) {
      const isRateLimit = error?.status === 429 || error?.message?.includes('429');
      
      if (isRateLimit && attempt < maxRetries - 1) {
        console.warn(`[AI Key Rotation] Key hit rate limit. Swapping to next key... (Attempt ${attempt + 1}/${maxRetries})`);
        attempt++;
        // Minor backoff before hitting the next key
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }
      
      // If it's not a rate limit, or we exhausted retries, throw the error
      throw error;
    }
  }
  
  throw new Error("Failed to execute API call after multiple key rotations.");
}
