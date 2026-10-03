import { Pressable } from 'react-native';

import { useColors } from '@/theme/useColors';

import { tap } from './Button';
import { Icon } from './Icon';
import { Txt } from './Txt';

export function Chip({
  label,
  selected,
  onPress,
  showCheck,
  role = 'button',
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  showCheck?: boolean;
  role?: 'button' | 'radio' | 'checkbox';
}) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole={role}
      accessibilityState={role === 'button' ? { selected } : { checked: !!selected }}
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={({ pressed }) => ({
        height: 40,
        paddingHorizontal: 16,
        borderRadius: 999,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: selected ? c.soft : c.surface,
        borderWidth: 1,
        borderColor: selected ? c.soft : c.line,
        opacity: pressed ? 0.75 : 1,
      })}>
      {showCheck && selected ? <Icon name="checkmark" size={16} color={c.softInk} /> : null}
      <Txt variant="label" color={selected ? c.softInk : c.ink}>
        {label}
      </Txt>
    </Pressable>
  );
}
