import { router } from 'expo-router';
import { Pressable } from 'react-native';

import { useStore } from '@/store/useStore';
import { useColors } from '@/theme/useColors';

import { Icon } from './Icon';
import { Txt } from './Txt';

export function GemPill() {
  const c = useColors();
  const gems = useStore((s) => s.gems);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${gems.toLocaleString()} gems. Open gems`}
      onPress={() => router.push('/gems')}
      style={({ pressed }) => ({
        height: 36,
        paddingHorizontal: 14,
        borderRadius: 999,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: c.surface,
        borderWidth: 1,
        borderColor: c.line,
        opacity: pressed ? 0.7 : 1,
      })}>
      <Icon name="diamond-outline" size={16} color={c.link} />
      <Txt variant="label">{gems.toLocaleString()}</Txt>
    </Pressable>
  );
}
