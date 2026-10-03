import { useStore } from '@/store/useStore';

import { palettes, type Palette } from './tokens';

export function useColors(): Palette {
  const theme = useStore((s) => s.theme);
  return palettes[theme];
}
