import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, View, type ScrollViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/theme/useColors';

import { IconButton } from './Button';
import { Icon, type IconName } from './Icon';
import { Txt } from './Txt';

export function Screen({ children, bg, style }: { children: ReactNode; bg?: string; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  return <View style={[{ flex: 1, backgroundColor: bg ?? c.bg }, style]}>{children}</View>;
}

export function goBack(fallback = '/') {
  if (router.canGoBack()) router.back();
  else router.replace(fallback as never);
}

/** Large WhatsApp-style title header used on tab roots. */
export function TabHeader({ title, right }: { title: string; right?: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Txt variant="title" accessibilityRole="header" style={{ flex: 1 }}>
        {title}
      </Txt>
      {right}
    </View>
  );
}

/** Compact header with back button for pushed screens. */
export function StackHeader({
  title,
  subtitle,
  right,
  onBack,
  backIcon = 'chevron-back',
  bg,
  border,
  left,
}: {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  onBack?: () => void;
  backIcon?: IconName;
  bg?: string;
  border?: boolean;
  left?: ReactNode;
}) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: insets.top + 4,
        paddingHorizontal: 8,
        paddingBottom: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: bg,
        borderBottomWidth: border ? 1 : 0,
        borderBottomColor: c.line,
      }}>
      <IconButton name={backIcon} label={backIcon === 'close' ? 'Close' : 'Back'} onPress={onBack ?? (() => goBack())} />
      {left ?? (
        <View style={{ flex: 1, alignItems: 'center' }}>
          {title ? (
            <Txt variant="bodyLg" weight="medium" accessibilityRole="header" numberOfLines={1}>
              {title}
            </Txt>
          ) : null}
          {subtitle ? (
            <Txt variant="micro" secondary numberOfLines={1}>
              {subtitle}
            </Txt>
          ) : null}
        </View>
      )}
      <View style={{ minWidth: 44, flexDirection: 'row', justifyContent: 'flex-end' }}>{right}</View>
    </View>
  );
}

export function Scroll({ children, contentStyle, ...rest }: ScrollViewProps & { contentStyle?: StyleProp<ViewStyle> }) {
  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[{ paddingHorizontal: 16, paddingBottom: 40, gap: 14 }, contentStyle]} {...rest}>
      {children}
    </ScrollView>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  return <View style={[{ backgroundColor: c.surface, borderRadius: 28, paddingHorizontal: 16, paddingVertical: 6 }, style]}>{children}</View>;
}

export function Row({
  label,
  value,
  icon,
  onPress,
  danger,
  first,
  hint,
}: {
  label: string;
  value?: string;
  icon?: IconName;
  onPress?: () => void;
  danger?: boolean;
  first?: boolean;
  hint?: string;
}) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 10,
        borderTopWidth: first ? 0 : 1,
        borderTopColor: c.line2,
        opacity: pressed ? 0.6 : 1,
      })}>
      {icon ? <Icon name={icon} size={20} color={danger ? c.danger : c.ink} /> : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Txt color={danger ? c.danger : c.ink}>{label}</Txt>
        {hint ? (
          <Txt variant="caption" secondary>
            {hint}
          </Txt>
        ) : null}
      </View>
      {value ? (
        <Txt variant="label" secondary>
          {value}
        </Txt>
      ) : null}
      {!danger ? <Icon name="chevron-forward" size={16} color={c.muted} /> : null}
    </Pressable>
  );
}

export function SectionTitle({ children, action }: { children: string; action?: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 10 }}>
      <Txt variant="heading" accessibilityRole="header">
        {children}
      </Txt>
      {action}
    </View>
  );
}

export function Empty({ icon, title, body, action }: { icon: IconName; title: string; body: string; action?: ReactNode }) {
  const c = useColors();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32, gap: 12 }}>
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: c.soft, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={32} color={c.softInk} />
      </View>
      <Txt variant="heading" center>
        {title}
      </Txt>
      <Txt secondary center>
        {body}
      </Txt>
      {action}
    </View>
  );
}
