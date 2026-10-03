import Constants from 'expo-constants';
import { Platform } from 'react-native';

import type { Character } from '@/data/characters';
import { shortName } from '@/lib/format';
import { activePath, findCharacter, messageText } from '@/store/useStore';
import type { Chat, Message, Persona } from '@/store/types';

import type { ReplyRequest, ReplyResponse } from './ai-types';

/**
 * Where the /api routes live. Web uses the same origin. Native uses EXPO_PUBLIC_API_URL when set
 * (a deployed server), otherwise the dev server that Expo Go or a dev build is connected to.
 */
function apiBase(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL;
  if (configured) return configured.replace(/\/$/, '');
  if (Platform.OS === 'web') return '';
  const host = Constants.expoConfig?.hostUri;
  return host ? `http://${host}` : '';
}

/** Group stories: reply as whoever the user addressed by name, else whoever spoke least recently. */
export function pickSpeaker(chat: Chat, characters: Character[], lastUserText: string): string {
  if (chat.characterIds.length === 1) return chat.characterIds[0];
  if (chat.nextSpeaker !== 'auto' && chat.characterIds.includes(chat.nextSpeaker)) return chat.nextSpeaker;
  const lower = lastUserText.toLowerCase();
  const named = characters.find((c) => lower.includes(shortName(c.name).toLowerCase()) || lower.includes(c.name.toLowerCase()));
  if (named) return named.id;
  const msgs = activePath(chat).messages;
  const lastSpoke = (id: string) => {
    for (let i = msgs.length - 1; i >= 0; i--) if (msgs[i].characterId === id) return i;
    return -1;
  };
  return [...chat.characterIds].sort((a, b) => lastSpoke(a) - lastSpoke(b))[0];
}

export async function requestReply(opts: {
  chat: Chat;
  persona: Persona;
  custom: Character[];
  speakerId: string;
  /** Messages the reply should follow (defaults to the whole active path). */
  history?: Message[];
  mode?: 'reply' | 'continue';
  safe: boolean;
}): Promise<string> {
  const characters = opts.chat.characterIds
    .map((id) => findCharacter(id, opts.custom))
    .filter((c): c is Character => !!c)
    .map((c) => ({ id: c.id, name: c.name, description: c.description, scenario: c.scenario, exampleLines: c.exampleLines }));
  const history = (opts.history ?? activePath(opts.chat).messages).map((m) => ({
    speakerId: m.role === 'user' ? 'user' : m.characterId ?? 'unknown',
    text: messageText(m),
  }));
  const body: ReplyRequest = {
    characters,
    speakerId: opts.speakerId,
    persona: { name: opts.persona.name, pronouns: opts.persona.pronouns, bio: opts.persona.bio },
    memories: opts.chat.memories.map((m) => m.text),
    history,
    mode: opts.mode ?? 'reply',
    replyLength: opts.chat.replyLength,
    safe: opts.safe,
  };
  const res = await fetch(`${apiBase()}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({ error: 'The story engine sent an unreadable reply.' }))) as ReplyResponse;
  if ('error' in data) throw new Error(data.error);
  return data.text;
}

/** Simple local check so crisis resources show immediately, before any model reply. */
const RISK = /\b(kill myself|killing myself|suicid\w*|end my life|want to die|self[- ]?harm|hurt myself|cutting myself)\b/i;
export function looksLikeRisk(text: string): boolean {
  return RISK.test(text);
}
