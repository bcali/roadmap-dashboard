import Anthropic from '@anthropic-ai/sdk';

export interface AnalysisRequest {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  budgetTokens?: number;
}

export interface AnalysisResponse {
  thinking: string;
  response: string;
  inputTokens: number;
  outputTokens: number;
  thinkingTokens: number;
  costEstimate: number;
}

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2000;

/**
 * Call Claude Opus 4.6 with extended thinking for deep analysis.
 */
export async function analyzeWithClaude(request: AnalysisRequest): Promise<AnalysisResponse> {
  const client = new Anthropic(); // Uses ANTHROPIC_API_KEY env var

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: request.maxTokens ?? 16000,
        thinking: {
          type: 'enabled',
          budget_tokens: request.budgetTokens ?? 10000,
        },
        system: request.systemPrompt,
        messages: [{ role: 'user', content: request.userPrompt }],
      });

      let thinking = '';
      let text = '';

      for (const block of response.content) {
        if (block.type === 'thinking') {
          thinking = block.thinking;
        } else if (block.type === 'text') {
          text = block.text;
        }
      }

      const inputTokens = response.usage.input_tokens;
      const outputTokens = response.usage.output_tokens;

      // Opus pricing: input $15/M, output $75/M
      // Thinking tokens count toward output
      const costEstimate =
        (inputTokens / 1_000_000) * 15 +
        (outputTokens / 1_000_000) * 75;

      return {
        thinking,
        response: text,
        inputTokens,
        outputTokens,
        thinkingTokens: 0, // included in outputTokens
        costEstimate,
      };
    } catch (error: any) {
      lastError = error;

      // Retry on rate limits and overloaded
      if (error?.status === 429 || error?.status === 529) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(`API attempt ${attempt}/${MAX_RETRIES} failed (${error.status}), retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      throw error;
    }
  }

  throw lastError ?? new Error('Analysis failed after retries');
}

/**
 * Estimate token count from text (rough: ~4 chars per token).
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
