import { Pressable, View } from 'react-native';

import type { Character } from '@/data/characters';
import { messageText } from '@/store/useStore';
import type { Message } from '@/store/types';
import { useColors } from '@/theme/useColors';

import { Avatar } from './Avatar';
import { IconButton } from './Button';
import { Icon } from './Icon';
import { StoryText } from './StoryText';
import { Txt } from './Txt';

export function MessageBubble({
  message,
  character,
  nameColor,
  group,
  showSwipe,
  canGenerate,
  onLongPress,
  onPrev,
  onNext,
}: {
  message: Message;
  character?: Character;
  nameColor?: string;
  group: boolean;
  showSwipe: boolean;
  canGenerate: boolean;
  onLongPress: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const c = useColors();
  const mine = message.role === 'user';
  const text = messageText(message);
  const count = message.alts.length;
  const bubble = (
    <Pressable
      onLongPress={onLongPress}
      delayLongPress={300}
      accessibilityRole="button"
      accessibilityLabel={`${mine ? 'You' : character?.name ?? 'Character'}: ${text.replace(/\*/g, '')}`}
      accessibilityHint="Long press for options like pin, edit and branch"
      style={({ pressed }) => ({
        maxWidth: '100%',
        backgroundColor: mine ? c.bubbleOut : c.bubbleIn,
        borderRadius: 18,
        borderBottomRightRadius: mine ? 6 : 18,
        borderBottomLeftRadius: mine ? 18 : 6,
        paddingHorizontal: 12,
        paddingTop: 7,
        paddingBottom: 8,
        opacity: pressed ? 0.85 : 1,
      })}>
      {group && !mine && character ? (
        <Txt variant="caption" weight="semibold" color={nameColor} style={{ marginBottom: 2 }}>
          {character.name}
        </Txt>
      ) : null}
      {message.pinned ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}>
          <Icon name="pin" size={12} color={c.link} />
          <Txt variant="micro" color={c.link}>
            Pinned to memory
          </Txt>
        </View>
      ) : null}
      <StoryText text={text} />
    </Pressable>
  );

  return (
    <View style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '86%', marginVertical: 3 }}>
      {group && !mine ? (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
          <Avatar image={character?.image} name={character?.name ?? '?'} size={28} />
          <View style={{ flexShrink: 1 }}>{bubble}</View>
        </View>
      ) : (
        bubble
      )}
      {!mine && (showSwipe || count > 1) ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: group ? 34 : 0, marginTop: 2 }}>
          <IconButton name="chevron-back" label="Previous reply" size={36} onPress={onPrev} color={message.alt > 0 ? c.ink : c.muted} />
          <Txt variant="caption" secondary accessibilityLiveRegion="polite" style={{ minWidth: 34, textAlign: 'center' }}>
            {message.alt + 1} / {count}
          </Txt>
          <IconButton
            name="chevron-forward"
            label={message.alt < count - 1 ? 'Next reply' : 'Write another reply'}
            size={36}
            onPress={onNext}
            color={message.alt < count - 1 || canGenerate ? c.ink : c.muted}
          />
          {showSwipe && message.alt === count - 1 && canGenerate ? (
            <Txt variant="micro" secondary>
              Swipe for another reply
            </Txt>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export function TypingBubble({ name, group }: { name?: string; group: boolean }) {
  const c = useColors();
  return (
    <View accessibilityLiveRegion="polite" accessibilityLabel={`${name ?? 'Character'} is writing`} style={{ alignSelf: 'flex-start', marginVertical: 4, backgroundColor: c.bubbleIn, borderRadius: 18, borderBottomLeftRadius: 6, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
      <Txt variant="caption" secondary>
        {group && name ? `${name} is writing` : 'Writing'}
      </Txt>
      <View style={{ flexDirection: 'row', gap: 3 }}>
        {[c.ink2, c.muted, c.lineStrong].map((col, i) => (
          <View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: col }} />
        ))}
      </View>
    </View>
  );
}
