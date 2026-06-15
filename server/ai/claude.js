import Groq from 'groq-sdk';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function runChallenge(playerPrompt, challenge) {
  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 1024,
    messages: [
      { role: 'system', content: challenge.systemPrompt || 'You are a helpful AI assistant.' },
      { role: 'user', content: playerPrompt },
    ],
  });

  return {
    content: response.choices[0].message.content,
    tokensUsed: (response.usage?.prompt_tokens ?? 0) + (response.usage?.completion_tokens ?? 0),
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

  const result = await client.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    max_tokens: 300,
    messages: [{ role: 'user', content: judgePrompt }],
  });

  const text = result.choices[0].message.content;
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch {}
    }
    return { score: 50, feedback: 'Good attempt!', tip: 'Try being more specific about the desired format.' };
  }
}
