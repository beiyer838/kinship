import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/theme/useColors';

import { IconButton } from './Button';
import { goBack } from './Layout';
import { Txt } from './Txt';

export function StepHeader({ step, total }: { step: number; total: number }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <IconButton name="chevron-back" label="Back" onPress={() => goBack('/welcome')} />
      <View accessibilityLabel={`Step ${step} of ${total}`} style={{ flex: 1, flexDirection: 'row', gap: 6 }}>
        {Array.from({ length: total }, (_, i) => (
          <View key={i} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: i < step ? c.accent : c.line }} />
        ))}
      </View>
      <Txt variant="caption" secondary style={{ marginRight: 8 }}>
        {step} of {total}
      </Txt>
    </View>
  );
}
