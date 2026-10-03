import type { ReplyRequest } from '@/lib/ai-types';

type Content = { role: 'user' | 'model'; parts: { text: string }[] };

const LENGTH: Record<ReplyRequest['replyLength'], string> = {
  Short: 'Keep it short: one to two sentences.',
  Balanced: 'Write two to four sentences.',
  Long: 'Write one or two rich paragraphs.',
};

const LIMIT = 4000;
const clip = (s: string, n = LIMIT) => (s.length > n ? s.slice(0, n) : s);

export function buildPrompt(req: ReplyRequest): { system: string; contents: Content[] } {
  const speaker = req.characters.find((c) => c.id === req.speakerId) ?? req.characters[0];
  const others = req.characters.filter((c) => c.id !== speaker.id);
  const nameOf = (id: string) => (id === 'user' ? req.persona.name : req.characters.find((c) => c.id === id)?.name ?? 'Someone');

  const lines = [
    `You are ${speaker.name}, a character in an interactive story on Kinship, a fiction and roleplay app for adults.`,
    `About ${speaker.name}: ${clip(speaker.description)}`,
    speaker.scenario ? `Scenario: ${clip(speaker.scenario)}` : '',
    speaker.exampleLines ? `Example of how ${speaker.name} talks: ${clip(speaker.exampleLines, 1500)}` : '',
    others.length
      ? `Also in this scene (never speak or act for them): ${others.map((o) => `${o.name}: ${clip(o.description, 600)}`).join(' | ')}`
      : '',
    `The user plays ${req.persona.name} (${req.persona.pronouns || 'pronouns not given'}).${req.persona.bio ? ` About them: ${clip(req.persona.bio, 1000)}` : ''}`,
    req.memories.length ? `Pinned memories. Treat these as true and never contradict them:\n- ${req.memories.map((m) => clip(m, 500)).join('\n- ')}` : '',
    `Write only ${speaker.name}'s next message. Stay in character. Wrap actions and narration in *asterisks*; put spoken words in plain text or quotes. Never write ${req.persona.name}'s actions, thoughts or dialogue. Do not prefix your message with your name. ${LENGTH[req.replyLength]}`,
    req.safe
      ? 'Keep everything suitable for a general audience: no sexual content and no graphic violence.'
      : 'Mature themes are allowed, but never sexual content involving anyone under 18 and nothing that encourages real-world harm.',
    `If ${req.persona.name}'s messages suggest the real person is in danger or thinking about self-harm or suicide, step out of the story kindly, encourage them to talk to someone they trust, and mention 988 (US) or Samaritans on 116 123 (UK and Ireland).`,
  ];

  const contents: Content[] = [];
  const push = (role: Content['role'], text: string) => {
    const last = contents[contents.length - 1];
    if (last && last.role === role) last.parts[0].text += `\n\n${text}`;
    else contents.push({ role, parts: [{ text }] });
  };
  for (const h of req.history.slice(-40)) {
    if (h.speakerId === speaker.id) push('model', clip(h.text));
    else push('user', `${nameOf(h.speakerId)}: ${clip(h.text)}`);
  }
  if (req.mode === 'continue' || contents.length === 0 || contents[contents.length - 1].role === 'model') {
    push('user', `(Continue the scene as ${speaker.name}. Move the story forward; don't repeat earlier lines.)`);
  }
  return { system: lines.filter(Boolean).join('\n\n'), contents };
}

/** Strips a leading "Name:" the model sometimes adds. */
export function cleanReply(text: string, speakerName: string): string {
  const t = text.trim();
  const prefix = new RegExp(`^\\**${speakerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\**\\s*:\\s*`, 'i');
  return t.replace(prefix, '').trim();
}
