import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { seedCharacters, storyPresets, type Character } from '@/data/characters';
import { GEMS } from '@/lib/economy';
import { daysBetween, today, uid } from '@/lib/id';
import type { ThemeName } from '@/theme/tokens';

import type { AppState, Chat, Message, Persona, ReplyLength, StoryPath } from './types';

type Actions = {
  completeOnboarding: (interests: string[], persona: Omit<Persona, 'id'>) => void;
  setInterests: (interests: string[]) => void;
  setTheme: (t: ThemeName) => void;
  setSafetyFilter: (on: boolean) => void;

  spendGems: (n: number) => boolean;
  claimCheckIn: () => number;
  watchAd: () => number;
  addGems: (n: number) => void;

  savePersona: (p: Persona) => void;
  deletePersona: (id: string) => void;
  setDefaultPersona: (id: string) => void;

  saveCharacter: (c: Character) => void;
  deleteCharacter: (id: string) => void;
  toggleLike: (id: string) => void;
  block: (id: string) => void;
  unblock: (id: string) => void;
  report: (kind: 'message' | 'character', targetId: string, reason: string) => void;

  startChat: (characterIds: string[], opts?: { title?: string; presetId?: string }) => string;
  deleteChat: (id: string) => void;
  markRead: (id: string) => void;
  bumpUnread: (id: string) => void;
  togglePinChat: (id: string) => void;
  setChatPersona: (id: string, personaId: string) => void;
  setReplyLength: (id: string, len: ReplyLength) => void;
  setNextSpeaker: (id: string, speaker: string) => void;
  addCharacterToChat: (id: string, characterId: string) => void;

  appendMessage: (chatId: string, msg: Omit<Message, 'id' | 'createdAt' | 'alt'> & { alt?: number }) => string;
  addAlternative: (chatId: string, messageId: string, text: string) => void;
  setAlternative: (chatId: string, messageId: string, alt: number) => void;
  editMessage: (chatId: string, messageId: string, text: string) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  rewindTo: (chatId: string, messageId: string) => void;
  branchFrom: (chatId: string, messageId: string) => void;
  switchPath: (chatId: string, pathId: string) => void;
  restartChat: (chatId: string) => void;

  pinMessage: (chatId: string, messageId: string) => void;
  addMemory: (chatId: string, text: string) => void;
  editMemory: (chatId: string, memoryId: string, text: string) => void;
  removeMemory: (chatId: string, memoryId: string) => void;
  resetAll: () => void;
};

const defaultPersona: Persona = { id: 'persona_default', name: 'You', pronouns: 'they/them', bio: '' };

const initialState: AppState = {
  onboarded: false,
  interests: [],
  theme: 'Classic',
  safetyFilter: true,
  gems: GEMS.starting,
  checkIn: { lastDate: null, streak: 0 },
  ads: { date: '', count: 0 },
  personas: [defaultPersona],
  defaultPersonaId: defaultPersona.id,
  customCharacters: [],
  liked: [],
  blocked: [],
  reports: [],
  chats: [],
};

export function findCharacter(id: string, custom: Character[]): Character | undefined {
  return custom.find((c) => c.id === id) ?? seedCharacters.find((c) => c.id === id);
}

export function activePath(chat: Chat): StoryPath {
  return chat.paths.find((p) => p.id === chat.activePathId) ?? chat.paths[0];
}

export function messageText(m: Message): string {
  return m.alts[m.alt] ?? m.alts[0] ?? '';
}

/** Applies `fn` to the active path of one chat and bumps updatedAt. */
function withPath(chats: Chat[], chatId: string, fn: (path: StoryPath, chat: Chat) => StoryPath): Chat[] {
  return chats.map((c) => {
    if (c.id !== chatId) return c;
    const path = activePath(c);
    const next = fn(path, c);
    return { ...c, updatedAt: Date.now(), paths: c.paths.map((p) => (p.id === path.id ? next : p)) };
  });
}

function mapMessage(path: StoryPath, messageId: string, fn: (m: Message) => Message): StoryPath {
  return { ...path, messages: path.messages.map((m) => (m.id === messageId ? fn(m) : m)) };
}

export const useStore = create<AppState & Actions>()(
  persist(
    (set, get) => ({
      ...initialState,

      completeOnboarding: (interests, persona) => {
        const p: Persona = { ...persona, id: uid('persona_') };
        set({ onboarded: true, interests, personas: [p], defaultPersonaId: p.id });
      },
      setInterests: (interests) => set({ interests }),
      setTheme: (theme) => set({ theme }),
      setSafetyFilter: (safetyFilter) => set({ safetyFilter }),

      spendGems: (n) => {
        if (get().gems < n) return false;
        set({ gems: get().gems - n });
        return true;
      },
      claimCheckIn: () => {
        const { checkIn, gems } = get();
        const d = today();
        if (checkIn.lastDate === d) return 0;
        const continued = checkIn.lastDate !== null && daysBetween(checkIn.lastDate, d) === 1;
        const streak = continued ? (checkIn.streak % 7) + 1 : 1;
        const reward = streak === 7 ? GEMS.checkInDay7 : GEMS.checkIn;
        set({ gems: gems + reward, checkIn: { lastDate: d, streak } });
        return reward;
      },
      watchAd: () => {
        const d = today();
        const ads = get().ads.date === d ? get().ads : { date: d, count: 0 };
        if (ads.count >= GEMS.adsPerDay) return 0;
        set({ gems: get().gems + GEMS.adReward, ads: { date: d, count: ads.count + 1 } });
        return GEMS.adReward;
      },
      addGems: (n) => set({ gems: get().gems + n }),

      savePersona: (p) => {
        const exists = get().personas.some((x) => x.id === p.id);
        set({ personas: exists ? get().personas.map((x) => (x.id === p.id ? p : x)) : [...get().personas, p] });
      },
      deletePersona: (id) => {
        const personas = get().personas.filter((p) => p.id !== id);
        if (personas.length === 0) return;
        const defaultPersonaId = get().defaultPersonaId === id ? personas[0].id : get().defaultPersonaId;
        set({
          personas,
          defaultPersonaId,
          chats: get().chats.map((c) => (c.personaId === id ? { ...c, personaId: defaultPersonaId } : c)),
        });
      },
      setDefaultPersona: (id) => set({ defaultPersonaId: id }),

      saveCharacter: (c) => {
        const list = get().customCharacters;
        set({ customCharacters: list.some((x) => x.id === c.id) ? list.map((x) => (x.id === c.id ? c : x)) : [c, ...list] });
      },
      deleteCharacter: (id) =>
        set({
          customCharacters: get().customCharacters.filter((c) => c.id !== id),
          chats: get().chats.filter((c) => !c.characterIds.includes(id)),
        }),
      toggleLike: (id) => set({ liked: get().liked.includes(id) ? get().liked.filter((x) => x !== id) : [...get().liked, id] }),
      block: (id) => set({ blocked: [...new Set([...get().blocked, id])] }),
      unblock: (id) => set({ blocked: get().blocked.filter((x) => x !== id) }),
      report: (kind, targetId, reason) =>
        set({ reports: [...get().reports, { id: uid('r_'), kind, targetId, reason, createdAt: Date.now() }] }),

      startChat: (characterIds, opts) => {
        const preset = opts?.presetId ? storyPresets.find((p) => p.id === opts.presetId) : undefined;
        const now = Date.now();
        const custom = get().customCharacters;
        const opening = preset
          ? preset.opening
          : characterIds.slice(0, characterIds.length > 1 ? 2 : 1).map((id) => ({
              characterId: id,
              text: findCharacter(id, custom)?.greeting ?? '',
            }));
        const pathId = uid('path_');
        const chat: Chat = {
          id: uid('chat_'),
          characterIds,
          title: preset?.title ?? opts?.title,
          cover: preset?.cover,
          personaId: get().defaultPersonaId,
          paths: [
            {
              id: pathId,
              name: 'Main story',
              createdAt: now,
              messages: opening
                .filter((o) => o.text)
                .map((o, i) => ({ id: uid('m_'), role: 'character', characterId: o.characterId, alts: [o.text], alt: 0, createdAt: now + i })),
            },
          ],
          activePathId: pathId,
          memories: [],
          replyLength: 'Balanced',
          nextSpeaker: 'auto',
          unread: 0,
          createdAt: now,
          updatedAt: now,
        };
        set({ chats: [chat, ...get().chats] });
        return chat.id;
      },
      deleteChat: (id) => set({ chats: get().chats.filter((c) => c.id !== id) }),
      markRead: (id) => set({ chats: get().chats.map((c) => (c.id === id && c.unread ? { ...c, unread: 0 } : c)) }),
      bumpUnread: (id) => set({ chats: get().chats.map((c) => (c.id === id ? { ...c, unread: c.unread + 1 } : c)) }),
      togglePinChat: (id) => set({ chats: get().chats.map((c) => (c.id === id ? { ...c, pinnedChat: !c.pinnedChat } : c)) }),
      setChatPersona: (id, personaId) => set({ chats: get().chats.map((c) => (c.id === id ? { ...c, personaId } : c)) }),
      setReplyLength: (id, replyLength) => set({ chats: get().chats.map((c) => (c.id === id ? { ...c, replyLength } : c)) }),
      setNextSpeaker: (id, nextSpeaker) => set({ chats: get().chats.map((c) => (c.id === id ? { ...c, nextSpeaker } : c)) }),
      addCharacterToChat: (id, characterId) =>
        set({
          chats: get().chats.map((c) =>
            c.id === id && !c.characterIds.includes(characterId) ? { ...c, characterIds: [...c.characterIds, characterId] } : c,
          ),
        }),

      appendMessage: (chatId, msg) => {
        const id = uid('m_');
        set({
          chats: withPath(get().chats, chatId, (path) => ({
            ...path,
            messages: [...path.messages, { ...msg, id, alt: msg.alt ?? 0, createdAt: Date.now() }],
          })),
        });
        return id;
      },
      addAlternative: (chatId, messageId, text) =>
        set({
          chats: withPath(get().chats, chatId, (path) =>
            mapMessage(path, messageId, (m) => ({ ...m, alts: [...m.alts, text], alt: m.alts.length })),
          ),
        }),
      setAlternative: (chatId, messageId, alt) =>
        set({ chats: withPath(get().chats, chatId, (path) => mapMessage(path, messageId, (m) => ({ ...m, alt }))) }),
      editMessage: (chatId, messageId, text) =>
        set({
          chats: withPath(get().chats, chatId, (path) =>
            mapMessage(path, messageId, (m) => ({ ...m, alts: m.alts.map((a, i) => (i === m.alt ? text : a)) })),
          ),
        }),
      deleteMessage: (chatId, messageId) =>
        set({ chats: withPath(get().chats, chatId, (path) => ({ ...path, messages: path.messages.filter((m) => m.id !== messageId) })) }),
      rewindTo: (chatId, messageId) =>
        set({
          chats: withPath(get().chats, chatId, (path) => {
            const i = path.messages.findIndex((m) => m.id === messageId);
            return i < 0 ? path : { ...path, messages: path.messages.slice(0, i + 1) };
          }),
        }),
      branchFrom: (chatId, messageId) => {
        const chat = get().chats.find((c) => c.id === chatId);
        if (!chat) return;
        const path = activePath(chat);
        const i = path.messages.findIndex((m) => m.id === messageId);
        if (i < 0) return;
        const snippet = messageText(path.messages[i]).replace(/\*[^*]*\*/g, '').trim().slice(0, 32);
        const branch: StoryPath = {
          id: uid('path_'),
          name: `Path ${chat.paths.length + 1}`,
          branchedAt: snippet ? `“${snippet}…”` : undefined,
          createdAt: Date.now(),
          messages: path.messages.slice(0, i + 1).map((m) => ({ ...m, alts: [...m.alts] })),
        };
        set({
          chats: get().chats.map((c) =>
            c.id === chatId ? { ...c, paths: [...c.paths, branch], activePathId: branch.id, updatedAt: Date.now() } : c,
          ),
        });
      },
      switchPath: (chatId, pathId) => set({ chats: get().chats.map((c) => (c.id === chatId ? { ...c, activePathId: pathId } : c)) }),
      restartChat: (chatId) =>
        set({
          chats: withPath(get().chats, chatId, (path) => ({
            ...path,
            messages: path.messages.slice(0, Math.max(1, path.messages.findIndex((m) => m.role === 'user'))),
          })),
        }),

      pinMessage: (chatId, messageId) => {
        const chat = get().chats.find((c) => c.id === chatId);
        const msg = chat && activePath(chat).messages.find((m) => m.id === messageId);
        if (!chat || !msg) return;
        set({
          chats: withPath(get().chats, chatId, (path) => mapMessage(path, messageId, (m) => ({ ...m, pinned: true }))).map((c) =>
            c.id === chatId ? { ...c, memories: [...c.memories, { id: uid('mem_'), text: messageText(msg) }] } : c,
          ),
        });
      },
      addMemory: (chatId, text) =>
        set({ chats: get().chats.map((c) => (c.id === chatId ? { ...c, memories: [...c.memories, { id: uid('mem_'), text }] } : c)) }),
      editMemory: (chatId, memoryId, text) =>
        set({
          chats: get().chats.map((c) =>
            c.id === chatId ? { ...c, memories: c.memories.map((m) => (m.id === memoryId ? { ...m, text } : m)) } : c,
          ),
        }),
      removeMemory: (chatId, memoryId) =>
        set({ chats: get().chats.map((c) => (c.id === chatId ? { ...c, memories: c.memories.filter((m) => m.id !== memoryId) } : c)) }),
      resetAll: () => set({ ...initialState }),
    }),
    {
      name: 'kinship-store',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
