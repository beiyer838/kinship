import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Screen, Scroll, StackHeader } from '@/components/Layout';
import { PRONOUNS, PersonaForm, type PersonaDraft } from '@/components/PersonaForm';
import { uid } from '@/lib/id';
import { useStore } from '@/store/useStore';
import { useColors } from '@/theme/useColors';

export default function EditPersona() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const existing = useStore((s) => s.personas.find((p) => p.id === id));
  const count = useStore((s) => s.personas.length);
  const savePersona = useStore((s) => s.savePersona);
  const deletePersona = useStore((s) => s.deletePersona);
  const [draft, setDraft] = useState<PersonaDraft>(() => ({
    name: existing?.name ?? '',
    pronouns: existing?.pronouns ?? 'they/them',
    customPronouns: existing && !(PRONOUNS as readonly string[]).includes(existing.pronouns) ? existing.pronouns : '',
    bio: existing?.bio ?? '',
    image: existing?.image,
  }));

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <StackHeader title={existing ? 'Edit persona' : 'New persona'} />
        <Scroll contentStyle={{ paddingHorizontal: 20 }}>
          <PersonaForm draft={draft} onChange={setDraft} />
          {existing && count > 1 ? (
            <Button
              label="Delete persona"
              kind="danger"
              onPress={() =>
                Alert.alert(`Delete ${existing.name}?`, 'Chats using it will switch to your default persona.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => { deletePersona(existing.id); router.back(); } },
                ])
              }
            />
          ) : null}
        </Scroll>
        <View style={{ padding: 16, paddingBottom: insets.bottom + 12, borderTopWidth: 1, borderTopColor: c.line }}>
          <Button
            label="Save"
            disabled={!draft.name.trim()}
            onPress={() => {
              savePersona({ id: existing?.id ?? uid('persona_'), name: draft.name.trim(), pronouns: draft.pronouns, bio: draft.bio.trim(), image: draft.image });
              router.back();
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
