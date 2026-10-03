import type { Character } from '@/data/characters';
import type { ImageRef } from '@/data/images';
import type { ThemeName } from '@/theme/tokens';

export type Persona = {
  id: string;
  name: string;
  pronouns: string;
  bio: string;
  image?: ImageRef;
};

export type Message = {
  id: string;
  role: 'user' | 'character';
  characterId?: string;
  /** Swipeable alternatives. `alt` is the one showing. */
  alts: string[];
  alt: number;
  pinned?: boolean;
  createdAt: number;
};

export type StoryPath = {
  id: string;
  name: string;
  messages: Message[];
  /** Where this path branched off, for display. */
  branchedAt?: string;
  createdAt: number;
};

export type Memory = { id: string; text: string };

export type ReplyLength = 'Short' | 'Balanced' | 'Long';

export type Chat = {
  id: string;
  characterIds: string[];
  title?: string;
  cover?: ImageRef;
  personaId: string;
  paths: StoryPath[];
  activePathId: string;
  memories: Memory[];
  replyLength: ReplyLength;
  /** 'auto' or a characterId. Only used in group stories. */
  nextSpeaker: string;
  unread: number;
  pinnedChat?: boolean;
  createdAt: number;
  updatedAt: number;
};

export type Report = { id: string; kind: 'message' | 'character'; targetId: string; reason: string; createdAt: number };

export type AppState = {
  onboarded: boolean;
  interests: string[];
  theme: ThemeName;
  safetyFilter: boolean;
  gems: number;
  checkIn: { lastDate: string | null; streak: number };
  ads: { date: string; count: number };
  personas: Persona[];
  defaultPersonaId: string;
  customCharacters: Character[];
  liked: string[];
  blocked: string[];
  reports: Report[];
  chats: Chat[];
};
