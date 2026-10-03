import { Linking, Pressable, View } from 'react-native';

import { useColors } from '@/theme/useColors';

import { Button } from './Button';
import { Icon } from './Icon';
import { Sheet } from './Sheet';
import { Txt } from './Txt';

export const CRISIS_LINES = [
  { name: '988 Suicide & Crisis Lifeline', where: 'US · call or text 988', tel: '988' },
  { name: 'Samaritans', where: 'UK & Ireland · call 116 123', tel: '116123' },
];

export function CrisisLines() {
  const c = useColors();
  return (
    <View style={{ gap: 10 }}>
      {CRISIS_LINES.map((l) => (
        <Pressable
          key={l.tel}
          accessibilityRole="link"
          accessibilityLabel={`Call ${l.name}, ${l.where}`}
          onPress={() => Linking.openURL(`tel:${l.tel}`).catch(() => {})}
          style={{ minHeight: 56, borderRadius: 28, backgroundColor: c.surface, flexDirection: 'row', alignItems: 'center', paddingLeft: 18, paddingRight: 8, gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Txt variant="label" weight="medium">
              {l.name}
            </Txt>
            <Txt variant="micro" secondary>
              {l.where}
            </Txt>
          </View>
          <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="call-outline" size={18} color={c.onAccent} />
          </View>
        </Pressable>
      ))}
      <Txt variant="label" color={c.link} onPress={() => Linking.openURL('https://findahelpline.com').catch(() => {})}>
        Find help in another country
      </Txt>
    </View>
  );
}

export function CrisisSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const c = useColors();
  return (
    <Sheet visible={visible} onClose={onClose}>
      <View style={{ backgroundColor: c.soft, borderRadius: 28, padding: 18, gap: 14 }}>
        <Txt variant="heading" color={c.softInk}>
          You don’t have to go through this alone
        </Txt>
        <Txt variant="label" color={c.softInk}>
          If you’re thinking about hurting yourself, please talk to someone now. These lines are free and confidential.
        </Txt>
        <CrisisLines />
      </View>
      <Button label="Back to the story" kind="soft" onPress={onClose} style={{ marginTop: 12 }} />
    </Sheet>
  );
}
