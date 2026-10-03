import { Image } from 'expo-image';
import { View } from 'react-native';

import { imageSource, type ImageRef } from '@/data/images';
import { useColors } from '@/theme/useColors';

import { Txt } from './Txt';

export function initials(name: string): string {
  const parts = name.replace(/[^\p{L}\p{N} ]/gu, '').trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?';
}

export function Avatar({ image, name, size = 48, radius }: { image?: ImageRef; name: string; size?: number; radius?: number }) {
  const c = useColors();
  const src = imageSource(image);
  const r = radius ?? size / 2;
  return (
    <View style={{ width: size, height: size, borderRadius: r, backgroundColor: c.soft, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
      {src ? (
        <Image source={src} style={{ width: size, height: size }} contentFit="cover" contentPosition="top" accessibilityIgnoresInvertColors />
      ) : (
        <Txt weight="medium" color={c.softInk} style={{ fontSize: size * 0.36, lineHeight: size * 0.44 }}>
          {initials(name)}
        </Txt>
      )}
    </View>
  );
}
