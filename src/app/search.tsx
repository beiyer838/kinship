import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/Button';
import { CharacterRow } from '@/components/CharacterViews';
import { Chip } from '@/components/Chip';
import { ToggleRow } from '@/components/Form';
import { Icon } from '@/components/Icon';
import { Card, Empty, goBack, Screen } from '@/components/Layout';
import { Txt } from '@/components/Txt';
import { GENRES, MOODS, ROLES } from '@/data/characters';
import { useCatalog } from '@/hooks/useCatalog';
import { useStore } from '@/store/useStore';
import { fonts } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

type Facet = 'Genre' | 'Mood' | 'Role';

export default function Search() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ role?: string; genre?: string }>();
  const catalog = useCatalog();
  const safety = useStore((s) => s.safetyFilter);
  const setSafety = useStore((s) => s.setSafetyFilter);
  const [q, setQ] = useState('');
  const [facet, setFacet] = useState<Facet>(params.role ? 'Role' : 'Genre');
  const [filter, setFilter] = useState<string | null>(params.role ?? params.genre ?? null);

  const options = facet === 'Genre' ? GENRES : facet === 'Mood' ? MOODS : ROLES;
  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return catalog.filter((ch) => {
      if (filter && ![...ch.genres, ...ch.moods, ...ch.roles].includes(filter)) return false;
      if (!needle) return true;
      return [ch.name, ch.tagline, ch.creator, ...ch.tags, ...ch.genres].some((s) => s.toLowerCase().includes(needle));
    });
  }, [catalog, q, filter]);

  return (
    <Screen>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <IconButton name="chevron-back" label="Back" onPress={() => goBack()} />
        <View style={{ flex: 1, height: 44, borderRadius: 22, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 8 }}>
          <Icon name="search" size={18} color={c.ink2} />
          <TextInput
            autoFocus={!params.role}
            accessibilityLabel="Search characters"
            placeholder="Search characters, tags, creators"
            placeholderTextColor={c.muted}
            value={q}
            onChangeText={setQ}
            returnKeyType="search"
            style={{ flex: 1, color: c.ink, fontFamily: fonts.regular, fontSize: 16 }}
          />
          {q ? <IconButton name="close-circle" label="Clear search" size={32} color={c.muted} onPress={() => setQ('')} /> : null}
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Card>
          <ToggleRow label="Safe for work only" hint="Hides 18+ characters everywhere" value={safety} onChange={setSafety} />
        </Card>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['Genre', 'Mood', 'Role'] as Facet[]).map((f) => (
            <Chip key={f} label={`By ${f.toLowerCase()}`} selected={facet === f} onPress={() => setFacet(f)} />
          ))}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {options.map((o) => (
            <Chip key={o} label={o} selected={filter === o} onPress={() => setFilter(filter === o ? null : o)} />
          ))}
        </ScrollView>
        <Txt variant="caption" secondary style={{ marginTop: 4 }}>
          {results.length} {results.length === 1 ? 'character' : 'characters'}
          {filter ? ` · ${filter}` : ''}
        </Txt>
        {results.length ? (
          <Card>
            {results.map((ch, i) => (
              <CharacterRow key={ch.id} character={ch} first={i === 0} />
            ))}
          </Card>
        ) : (
          <Empty icon="search-outline" title="No one here yet" body="Try another word or filter, or make this character yourself." />
        )}
      </ScrollView>
    </Screen>
  );
}
