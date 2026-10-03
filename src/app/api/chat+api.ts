import type { ReplyRequest } from '@/lib/ai-types';
import { buildPrompt, cleanReply } from '@/server/prompt';

// Runs on the server only. The key never ships in the app bundle.
const API = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL = process.env.GEMINI_TEXT_MODEL || 'gemini-3.5-flash';

function bad(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return bad('The server is missing GEMINI_API_KEY.', 500);

  let body: ReplyRequest;
  try {
    body = (await request.json()) as ReplyRequest;
  } catch {
    return bad('Invalid JSON.');
  }
  if (!Array.isArray(body?.characters) || body.characters.length === 0 || body.characters.length > 8) return bad('Invalid characters.');
  if (!Array.isArray(body.history) || !body.persona || typeof body.speakerId !== 'string') return bad('Invalid request.');

  const { system, contents } = buildPrompt(body);
  const res = await fetch(`${API}/${MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents,
      generationConfig: {
        temperature: 1,
        maxOutputTokens: body.replyLength === 'Long' ? 900 : 500,
        thinkingConfig: { thinkingLevel: 'minimal' },
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error('Gemini error', res.status, detail.slice(0, 300));
    return bad(res.status === 429 ? 'Too many requests right now. Try again in a moment.' : 'The story engine is unavailable.', 502);
  }
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] }; finishReason?: string }[];
    promptFeedback?: { blockReason?: string };
  };
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  const text = parts.filter((p) => !p.thought && p.text).map((p) => p.text).join('');
  if (!text) {
    return bad(data.promptFeedback?.blockReason ? 'That message was blocked by the safety system. Try steering the story another way.' : 'No reply came back. Try again.', 422);
  }
  const speaker = body.characters.find((c) => c.id === body.speakerId) ?? body.characters[0];
  return Response.json({ text: cleanReply(text, speaker.name) });
}
