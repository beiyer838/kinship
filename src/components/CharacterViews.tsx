import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import type { Character } from '@/data/characters';
import { imageSource } from '@/data/images';
import { useColors } from '@/theme/useColors';

import { Avatar, initials } from './Avatar';
import { Txt } from './Txt';

export function CharacterTile({ character, width = 156 }: { character: Character; width?: number }) {
  const c = useColors();
  const src = imageSource(character.image);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${character.name}. ${character.tagline}`}
      onPress={() => router.push(`/character/${character.id}`)}
      style={({ pressed }) => ({ width, gap: 8, opacity: pressed ? 0.8 : 1 })}>
      <View style={{ width, height: width * 1.25, borderRadius: 28, overflow: 'hidden', backgroundColor: c.soft, alignItems: 'center', justifyContent: 'center' }}>
        {src ? (
          <Image source={src} style={{ width: '100%', height: '100%' }} contentFit="cover" contentPosition="top" />
        ) : (
          <Txt variant="display" color={c.softInk}>
            {initials(character.name)}
          </Txt>
        )}
        <View style={{ position: 'absolute', left: 10, top: 10, paddingHorizontal: 10, height: 26, borderRadius: 13, backgroundColor: c.surface, justifyContent: 'center' }}>
          <Txt variant="micro">{character.genres[0]}</Txt>
        </View>
      </View>
      <Txt numberOfLines={1}>{character.name}</Txt>
      <Txt variant="caption" secondary numberOfLines={2} style={{ marginTop: -4 }}>
        {character.tagline}
      </Txt>
    </Pressable>
  );
}

export function CharacterRow({
  character,
  first,
  right,
  onPress,
  checked,
}: {
  character: Character;
  first?: boolean;
  right?: React.ReactNode;
  /** Overrides opening the profile, e.g. to select the character. */
  onPress?: () => void;
  checked?: boolean;
}) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole={checked === undefined ? 'button' : 'checkbox'}
      accessibilityState={checked === undefined ? undefined : { checked }}
      accessibilityLabel={`${character.name}. ${character.tagline}`}
      onPress={onPress ?? (() => router.push(`/character/${character.id}`))}
      style={({ pressed }) => ({ flexDirection: 'row', gap: 14, alignItems: 'center', paddingVertical: 14, borderTopWidth: first ? 0 : 1, borderTopColor: c.line2, opacity: pressed ? 0.7 : 1 })}>
      <Avatar image={character.image} name={character.name} size={54} />
      <View style={{ flex: 1, gap: 3 }}>
        <Txt numberOfLines={1}>{character.name}</Txt>
        <Txt variant="caption" secondary numberOfLines={2}>
          {character.tagline}
        </Txt>
        <Txt variant="micro" color={c.link} numberOfLines={1}>
          {[...character.genres.slice(0, 2), ...character.roles.slice(0, 1)].join(' · ')}
          {character.own ? ' · Yours' : ` · ${character.creator}`}
        </Txt>
      </View>
      {right}
    </Pressable>
  );
}
