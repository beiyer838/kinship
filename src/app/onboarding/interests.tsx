import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Layout';
import { StepHeader } from '@/components/Progress';
import { Txt } from '@/components/Txt';
import { GENRES, ROLES } from '@/data/characters';
import { useColors } from '@/theme/useColors';

export default function Interests() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const [picked, setPicked] = useState<string[]>(['Romance', 'Fantasy', 'Mystery']);
  const [adult, setAdult] = useState(false);
  const toggle = (x: string) => setPicked((p) => (p.includes(x) ? p.filter((y) => y !== x) : [...p, x]));

  return (
    <Screen>
      <StepHeader step={1} total={2} />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
        <Txt variant="title" accessibilityRole="header">
          What pulls you in?
        </Txt>
        <Txt secondary>Pick a few. Discover will lead with characters that match. Change it anytime in Settings.</Txt>

        <Txt variant="caption" secondary style={{ marginTop: 14, letterSpacing: 0.4 }}>
          GENRES
        </Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {GENRES.map((g) => (
            <Chip key={g} label={g} selected={picked.includes(g)} onPress={() => toggle(g)} showCheck role="checkbox" />
          ))}
        </View>
        <Txt variant="caption" secondary style={{ marginTop: 14, letterSpacing: 0.4 }}>
          WHO DO YOU WANT TO MEET?
        </Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {ROLES.map((g) => (
            <Chip key={g} label={g} selected={picked.includes(g)} onPress={() => toggle(g)} showCheck role="checkbox" />
          ))}
        </View>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: adult }}
          onPress={() => setAdult(!adult)}
          style={{ marginTop: 20, flexDirection: 'row', gap: 14, backgroundColor: c.surface, borderRadius: 28, padding: 16 }}>
          <View style={{ width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: adult ? c.link : c.muted, backgroundColor: adult ? c.link : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
            {adult ? <Icon name="checkmark" size={16} color={c.surface} /> : null}
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Txt>{"I'm 18 or older"}</Txt>
            <Txt variant="caption" secondary>
              Required to use Kinship. You choose whether to see mature characters in Settings.
            </Txt>
          </View>
        </Pressable>
      </ScrollView>
      <View style={{ padding: 20, paddingBottom: insets.bottom + 16, borderTopWidth: 1, borderTopColor: c.line, gap: 8 }}>
        <Txt variant="caption" secondary center>
          {picked.length} picked
        </Txt>
        <Button
          label="Continue"
          disabled={!adult}
          onPress={() => router.push({ pathname: '/onboarding/persona', params: { interests: picked.join(',') } })}
        />
      </View>
    </Screen>
  );
}
