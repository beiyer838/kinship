import { Pressable, Switch, TextInput, View, type TextInputProps } from 'react-native';

import { fonts } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

import { tap } from './Button';
import { Txt } from './Txt';

export function Field({
  label,
  value,
  onChangeText,
  multiline,
  max,
  hint,
  ...rest
}: Omit<TextInputProps, 'style'> & { label: string; max?: number; hint?: string }) {
  const c = useColors();
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 18 }}>
        <Txt variant="caption" secondary>
          {label}
        </Txt>
        {max ? (
          <Txt variant="caption" secondary>
            {(value ?? '').length} / {max}
          </Txt>
        ) : null}
      </View>
      <TextInput
        {...rest}
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        maxLength={max}
        placeholderTextColor={c.muted}
        style={{
          minHeight: multiline ? 112 : 52,
          borderRadius: multiline ? 24 : 999,
          borderWidth: 1,
          borderColor: c.line,
          backgroundColor: c.surface,
          paddingHorizontal: 20,
          paddingTop: multiline ? 14 : 0,
          paddingBottom: multiline ? 14 : 0,
          textAlignVertical: multiline ? 'top' : 'center',
          color: c.ink,
          fontFamily: fonts.regular,
          fontSize: 16,
          lineHeight: multiline ? 22 : undefined,
        }}
      />
      {hint ? (
        <Txt variant="micro" secondary style={{ paddingHorizontal: 18 }}>
          {hint}
        </Txt>
      ) : null}
    </View>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  dark,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  dark?: boolean;
}) {
  const c = useColors();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      style={{ flexDirection: 'row', gap: 4, padding: 4, borderRadius: 999, backgroundColor: dark ? c.surface : c.fill, borderWidth: dark ? 1 : 0, borderColor: c.line }}>
      {options.map((o) => {
        const on = o === value;
        return (
          <Pressable
            key={o}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            onPress={() => {
              tap();
              onChange(o);
            }}
            style={{
              flex: 1,
              height: 40,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: on ? (dark ? c.ink : c.surface) : 'transparent',
            }}>
            <Txt variant="label" color={on ? (dark ? c.bg : c.ink) : c.ink2}>
              {o}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ToggleRow({ label, hint, value, onChange }: { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void }) {
  const c = useColors();
  return (
    <View style={{ minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }}>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt>{label}</Txt>
        {hint ? (
          <Txt variant="caption" secondary>
            {hint}
          </Txt>
        ) : null}
      </View>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onChange}
        trackColor={{ true: c.link, false: c.lineStrong }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={c.lineStrong}
      />
    </View>
  );
}

export function Radio({ checked }: { checked: boolean }) {
  const c = useColors();
  return (
    <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: checked ? c.link : c.muted, alignItems: 'center', justifyContent: 'center' }}>
      {checked ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.link }} /> : null}
    </View>
  );
}
