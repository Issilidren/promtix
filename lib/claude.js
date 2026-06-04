import Anthropic from '@anthropic-ai/sdk';

let _client;
function getClient() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

export async function runChallenge(playerPrompt, challenge) {
  const response = await getClient().messages.create({
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
  const result = await getClient().messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [{
      role: 'user',
      content: `You are a judge for Promtix, an educational AI prompting game.

Player's prompt:
<prompt>${playerPrompt}</prompt>

AI's response:
<response>${aiResponse}</response>

Criteria:
${criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Reply with valid JSON only:
{"score":<0-100>,"feedback":"<one encouraging sentence>","tip":"<one specific improvement>"}`
    }]
  });

  try {
    return JSON.parse(result.content[0].text);
  } catch {
    return { score: 50, feedback: 'Good attempt!', tip: 'Try being more specific about the desired format.' };
  }
}
