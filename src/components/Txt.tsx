import { Text, type TextProps, type TextStyle } from 'react-native';

import { fonts } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

type Variant = 'display' | 'title' | 'heading' | 'body' | 'bodyLg' | 'label' | 'caption' | 'micro';

const sizes: Record<Variant, TextStyle> = {
  display: { fontSize: 38, lineHeight: 42, letterSpacing: -0.8 },
  title: { fontSize: 28, lineHeight: 34, letterSpacing: -0.4 },
  heading: { fontSize: 20, lineHeight: 26 },
  bodyLg: { fontSize: 17, lineHeight: 24 },
  body: { fontSize: 16, lineHeight: 22 },
  label: { fontSize: 15, lineHeight: 20 },
  caption: { fontSize: 13, lineHeight: 18 },
  micro: { fontSize: 12, lineHeight: 16 },
};

type Props = TextProps & {
  variant?: Variant;
  weight?: 'regular' | 'medium' | 'semibold';
  color?: string;
  secondary?: boolean;
  italic?: boolean;
  center?: boolean;
};

export function Txt({ variant = 'body', weight = 'regular', color, secondary, italic, center, style, ...rest }: Props) {
  const c = useColors();
  return (
    <Text
      {...rest}
      style={[
        sizes[variant],
        { fontFamily: fonts[weight], color: color ?? (secondary ? c.ink2 : c.ink) },
        italic && { fontStyle: 'italic' },
        center && { textAlign: 'center' },
        style,
      ]}
    />
  );
}
