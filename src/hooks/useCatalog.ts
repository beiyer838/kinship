import { useMemo } from 'react';

import { seedCharacters, type Character } from '@/data/characters';
import { findCharacter, useStore } from '@/store/useStore';

/** Every character the user can browse: the community catalog plus their own, minus blocked and (with the filter on) 18+. */
export function useCatalog(): Character[] {
  const custom = useStore((s) => s.customCharacters);
  const safety = useStore((s) => s.safetyFilter);
  const blocked = useStore((s) => s.blocked);
  return useMemo(() => {
    const own = custom.filter((c) => c.visibility !== 'Private' || c.own);
    return [...own, ...seedCharacters].filter((c) => !blocked.includes(c.id) && !blocked.includes(c.creator) && !(safety && c.nsfw));
  }, [custom, safety, blocked]);
}

export function useCharacter(id: string | undefined): Character | undefined {
  const custom = useStore((s) => s.customCharacters);
  return useMemo(() => (id ? findCharacter(id, custom) : undefined), [id, custom]);
}

export function useCharacters(ids: string[]): Character[] {
  const custom = useStore((s) => s.customCharacters);
  const key = ids.join(',');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => ids.map((id) => findCharacter(id, custom)).filter((c): c is Character => !!c), [key, custom]);
}
