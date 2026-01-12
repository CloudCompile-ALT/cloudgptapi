
export interface FandomSettings {
  maxLoreTokens: number;
  autoSummarize: boolean;
  cacheMode: string;
  preferredSources: string[];
}

export interface LoreSnippet {
  title: string;
  content: string;
  source: string;
  relevance: number;
}

const REMOTE_PLUGIN_URL = 'https://king-dried-favors-latter.trycloudflare.com';

/**
 * Main entry point for the plugin pipeline - Now uses the remote VPS service
 */
export async function runFandomPlugin(messages: any[], settings: FandomSettings, apiKeyId?: string, modelId?: string): Promise<any[]> {
  try {
    console.log(`[FandomPlugin] Calling remote service at ${REMOTE_PLUGIN_URL}/execute for key: ${apiKeyId}, model: ${modelId}`);
    
    const response = await fetch(`${REMOTE_PLUGIN_URL}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        api_key_id: apiKeyId || 'default',
        model: modelId || 'unknown',
        settings
      }),
    });

    if (!response.ok) {
      console.error(`[FandomPlugin] Remote service error: ${response.status} ${response.statusText}`);
      return messages;
    }

    const data = await response.json();
    return data.messages || messages;
  } catch (error) {
    console.error('[FandomPlugin] Error calling remote pipeline:', error);
    return messages; // Fallback to original messages on error
  }
}
