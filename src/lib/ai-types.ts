/** Shape of POST /api/chat, shared by the app and the server route. */
export type ReplyRequest = {
  characters: { id: string; name: string; description: string; scenario: string; exampleLines?: string }[];
  speakerId: string;
  persona: { name: string; pronouns: string; bio: string };
  memories: string[];
  /** Oldest first. `speakerId` is a character id, or 'user'. */
  history: { speakerId: string; text: string }[];
  mode: 'reply' | 'continue';
  replyLength: 'Short' | 'Balanced' | 'Long';
  safe: boolean;
};

export type ReplyResponse = { text: string } | { error: string };
