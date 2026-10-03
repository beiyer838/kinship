import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useColors } from '@/theme/useColors';

import { Icon, type IconName } from './Icon';
import { Txt } from './Txt';

type Kind = 'primary' | 'outline' | 'dark' | 'soft' | 'danger';

export function tap() {
  if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
}

export function Button({
  label,
  onPress,
  kind = 'primary',
  icon,
  disabled,
  loading,
  small,
  style,
  accessibilityLabel,
}: {
  label: string;
  onPress?: () => void;
  kind?: Kind;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const c = useColors();
  const palette: Record<Kind, { bg: string; fg: string; border?: string }> = {
    primary: { bg: c.accent, fg: c.onAccent },
    outline: { bg: 'transparent', fg: c.ink, border: c.ink },
    dark: { bg: c.ink, fg: c.bg },
    soft: { bg: c.fill, fg: c.ink },
    danger: { bg: c.dangerFill, fg: c.danger },
  };
  const p = palette[kind];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled || !!loading }}
      disabled={disabled || loading}
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.base,
        { height: small ? 40 : 54, paddingHorizontal: small ? 16 : 24, backgroundColor: p.bg, opacity: disabled ? 0.45 : pressed ? 0.85 : 1 },
        p.border ? { borderWidth: 1, borderColor: p.border } : null,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Icon name={icon} size={small ? 16 : 20} color={p.fg} /> : null}
          <Txt variant={small ? 'label' : 'bodyLg'} weight="medium" color={p.fg}>
            {label}
          </Txt>
        </View>
      )}
    </Pressable>
  );
}

export function IconButton({
  name,
  onPress,
  label,
  color,
  bg,
  size = 44,
}: {
  name: IconName;
  onPress?: () => void;
  label: string;
  color?: string;
  bg?: string;
  size?: number;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={({ pressed }) => [
        { width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: bg ?? 'transparent', opacity: pressed ? 0.6 : 1 },
      ]}>
      <Icon name={name} size={Math.round(size * 0.5)} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
