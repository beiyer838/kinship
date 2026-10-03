import * as ImagePicker from 'expo-image-picker';
import { Pressable, View } from 'react-native';

import type { ImageRef } from '@/data/images';
import { useColors } from '@/theme/useColors';

import { Avatar } from './Avatar';
import { Field, Segmented } from './Form';
import { Icon } from './Icon';
import { Txt } from './Txt';

export const PRONOUNS = ['she/her', 'he/him', 'they/them', 'Custom'] as const;

export type PersonaDraft = { name: string; pronouns: string; customPronouns: string; bio: string; image?: ImageRef };

export async function pickImage(): Promise<ImageRef | undefined> {
  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
  if (res.canceled || !res.assets?.[0]) return undefined;
  return { kind: 'uri', uri: res.assets[0].uri };
}

export function PersonaForm({ draft, onChange }: { draft: PersonaDraft; onChange: (d: PersonaDraft) => void }) {
  const c = useColors();
  const preset = (PRONOUNS as readonly string[]).includes(draft.pronouns) ? (draft.pronouns as (typeof PRONOUNS)[number]) : 'Custom';
  return (
    <View style={{ gap: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choose persona photo"
          onPress={async () => {
            const img = await pickImage();
            if (img) onChange({ ...draft, image: img });
          }}>
          <Avatar image={draft.image} name={draft.name || '?'} size={88} />
          <View style={{ position: 'absolute', right: -4, bottom: -4, width: 36, height: 36, borderRadius: 18, backgroundColor: c.ink, borderWidth: 3, borderColor: c.bg, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="camera-outline" size={16} color={c.bg} />
          </View>
        </Pressable>
        <Txt variant="caption" secondary style={{ flex: 1 }}>
          Add a photo or keep the initial. Only shown in your chats.
        </Txt>
      </View>
      <Field label="Name" value={draft.name} onChangeText={(name) => onChange({ ...draft, name })} max={40} autoCapitalize="words" />
      <View style={{ gap: 8 }}>
        <Txt variant="caption" secondary style={{ paddingHorizontal: 18 }}>
          Pronouns
        </Txt>
        <Segmented
          label="Pronouns"
          dark
          options={PRONOUNS}
          value={preset}
          onChange={(p) => onChange({ ...draft, pronouns: p === 'Custom' ? draft.customPronouns || 'Custom' : p })}
        />
        {preset === 'Custom' ? (
          <Field
            label="Your pronouns"
            value={draft.customPronouns}
            onChangeText={(t) => onChange({ ...draft, customPronouns: t, pronouns: t || 'Custom' })}
            max={24}
          />
        ) : null}
      </View>
      <Field label="Bio — what characters know about you" value={draft.bio} onChangeText={(bio) => onChange({ ...draft, bio })} multiline max={400} />
    </View>
  );
}
