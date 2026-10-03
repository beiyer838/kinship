import { Text } from 'react-native';

import { fonts } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

/** Renders story text: segments wrapped in *asterisks* are actions, shown in italic grey. */
export function StoryText({ text, size = 16 }: { text: string; size?: number }) {
  const c = useColors();
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  return (
    <Text style={{ fontFamily: fonts.regular, fontSize: size, lineHeight: Math.round(size * 1.42), color: c.ink }}>
      {parts.map((p, i) =>
        p.startsWith('*') && p.endsWith('*') && p.length > 2 ? (
          <Text key={i} style={{ fontStyle: 'italic', color: c.ink2 }}>
            {p.slice(1, -1)}
          </Text>
        ) : (
          <Text key={i}>{p}</Text>
        ),
      )}
    </Text>
  );
}

/** Plain-text preview of story text for chat lists. */
export function previewText(text: string): string {
  return text.replace(/\*/g, '').replace(/\s+/g, ' ').trim();
}
