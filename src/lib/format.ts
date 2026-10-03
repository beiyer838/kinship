import type { Character } from '@/data/characters';
import type { Chat } from '@/store/types';

export function chatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const yest = new Date(now);
  yest.setDate(now.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return 'Yesterday';
  if (now.getTime() - ts < 6 * 86_400_000) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function chatTitle(chat: Chat, chars: Character[]): string {
  return chat.title ?? chars.map((c) => c.name).join(', ');
}

const TITLES = ['Det.', 'Prof.', 'Dr.', 'Capt.', 'Captain', 'Bosun', 'Sir', 'Lady', 'Lord'];

/** "Det. Rowan Hale" → "Rowan", "The Keeper" → "The Keeper", "Mara Vex" → "Mara". */
export function shortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts[0] === 'The') return name;
  if (parts.length > 1 && TITLES.includes(parts[0])) return parts[1];
  return parts[0];
}
