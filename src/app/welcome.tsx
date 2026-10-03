import { Image } from 'expo-image';
import { router } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Layout';
import { StoryText } from '@/components/StoryText';
import { Txt } from '@/components/Txt';
import { portraits } from '@/data/images';
import { useColors } from '@/theme/useColors';

const COLLAGE = [
  { src: portraits.mara, size: 128, left: 6, top: 18 },
  { src: portraits.sorel, size: 88, left: 152, top: 0 },
  { src: portraits.kenji, size: 96, right: 4, top: 40 },
  { src: portraits.keeper, size: 108, left: 112, top: 120 },
  { src: portraits.rowan, size: 76, right: 30, top: 168 },
];

export default function Welcome() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return (
    <Screen style={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16, paddingHorizontal: 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="chatbubble-ellipses-outline" size={20} color={c.onAccent} />
        </View>
        <Txt variant="heading">Kinship</Txt>
      </View>

      <View style={{ height: 320, marginTop: 20 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {COLLAGE.map((p, i) => (
          <Image
            key={i}
            source={p.src}
            style={{ position: 'absolute', width: p.size, height: p.size, borderRadius: p.size / 2, left: p.left, right: p.right, top: p.top }}
            contentFit="cover"
          />
        ))}
        <View style={{ position: 'absolute', left: 0, top: 236, maxWidth: 232, backgroundColor: c.bubbleIn, borderRadius: 18, borderBottomLeftRadius: 6, paddingHorizontal: 14, paddingVertical: 10 }}>
          <StoryText size={15} text="*draws her cutlass* You're late, stowaway." />
        </View>
        <View style={{ position: 'absolute', right: 0, top: 282, maxWidth: 220, backgroundColor: c.bubbleOut, borderRadius: 18, borderBottomRightRadius: 6, paddingHorizontal: 14, paddingVertical: 10 }}>
          <StoryText size={15} text="Then let's make it count, Captain." />
        </View>
      </View>

      <Txt variant="display" accessibilityRole="header" style={{ marginTop: 32 }}>
        Stories that talk back.
      </Txt>
      <Txt variant="bodyLg" secondary style={{ marginTop: 12 }}>
        Chat one-on-one with characters made by the community, or bring a few together and build a story as a group.
      </Txt>

      <View style={{ marginTop: 'auto', gap: 12 }}>
        <Button label="Get started" onPress={() => router.push('/onboarding/interests')} />
        <Txt variant="micro" secondary center>
          By continuing you agree to the Terms and Privacy Policy. Kinship is for adults 18+.
        </Txt>
      </View>
    </Screen>
  );
}
