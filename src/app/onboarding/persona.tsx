import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Layout';
import { PersonaForm, type PersonaDraft } from '@/components/PersonaForm';
import { StepHeader } from '@/components/Progress';
import { Txt } from '@/components/Txt';
import { useStore } from '@/store/useStore';
import { useColors } from '@/theme/useColors';

export default function OnboardPersona() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { interests } = useLocalSearchParams<{ interests?: string }>();
  const complete = useStore((s) => s.completeOnboarding);
  const [draft, setDraft] = useState<PersonaDraft>({ name: '', pronouns: 'they/them', customPronouns: '', bio: '' });

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <StepHeader step={2} total={2} />
        <ScrollView contentContainerStyle={{ padding: 20, gap: 18 }} keyboardShouldPersistTaps="handled">
          <View style={{ gap: 10 }}>
            <Txt variant="title" accessibilityRole="header">
              Who will you be?
            </Txt>
            <Txt secondary>Your persona is the role you play. Characters see its name and bio, so they react to you. Make more later and switch per chat.</Txt>
          </View>
          <PersonaForm draft={draft} onChange={setDraft} />
        </ScrollView>
        <View style={{ padding: 20, paddingBottom: insets.bottom + 16, borderTopWidth: 1, borderTopColor: c.line }}>
          <Button
            label="Start exploring"
            disabled={!draft.name.trim()}
            onPress={() => {
              complete(interests ? interests.split(',').filter(Boolean) : [], {
                name: draft.name.trim(),
                pronouns: draft.pronouns,
                bio: draft.bio.trim(),
                image: draft.image,
              });
              router.replace('/');
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
