import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function runChallenge(playerPrompt, challenge) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: challenge.systemPrompt || 'You are a helpful AI assistant.',
    messages: [{ role: 'user', content: playerPrompt }]
  });

  return {
    content: response.content[0].text,
    tokensUsed: response.usage.input_tokens + response.usage.output_tokens
  };
}

export async function judgeResponse(playerPrompt, aiResponse, criteria) {
  const judgePrompt = `You are a judge for Promtix, an educational game about AI prompting.

Player's prompt:
<prompt>${playerPrompt}</prompt>

AI's response to that prompt:
<response>${aiResponse}</response>

Evaluate against these criteria:
${criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Reply with valid JSON only — no markdown, no explanation outside the JSON:
{
  "score": <integer 0-100>,
  "feedback": "<one encouraging sentence about what worked>",
  "tip": "<one specific, actionable improvement>"
}`;

  const result = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [{ role: 'user', content: judgePrompt }]
  });

  try {
    return JSON.parse(result.content[0].text);
  } catch {
    return { score: 50, feedback: 'Good attempt!', tip: 'Try being more specific about the desired format.' };
  }
}
