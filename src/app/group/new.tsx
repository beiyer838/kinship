import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { CharacterRow } from '@/components/CharacterViews';
import { Field } from '@/components/Form';
import { Icon } from '@/components/Icon';
import { Card, Screen, Scroll, StackHeader } from '@/components/Layout';
import { Txt } from '@/components/Txt';
import { useCatalog } from '@/hooks/useCatalog';
import { useStore } from '@/store/useStore';
import { useColors } from '@/theme/useColors';
import { shortName } from '@/lib/format';

const MAX_CAST = 6;

export default function NewGroup() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ with?: string }>();
  const catalog = useCatalog();
  const startChat = useStore((s) => s.startChat);
  const [cast, setCast] = useState<string[]>(params.with ? [params.with] : []);
  const [title, setTitle] = useState('');

  const picked = useMemo(() => cast.map((id) => catalog.find((x) => x.id === id)).filter((x) => !!x), [cast, catalog]);
  const toggle = (id: string) => setCast((cs) => (cs.includes(id) ? cs.filter((x) => x !== id) : cs.length < MAX_CAST ? [...cs, id] : cs));

  return (
    <Screen>
      <StackHeader title="New group story" subtitle={`${cast.length} of up to ${MAX_CAST} characters`} />
      <Scroll>
        <Txt secondary>Pick at least two characters. Each one plays their own role, and you choose who replies next or leave it on Auto.</Txt>
        {picked.length ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {picked.map((p) => (
              <View key={p.id} style={{ alignItems: 'center', gap: 4, width: 64 }}>
                <Avatar image={p.image} name={p.name} size={56} />
                <Txt variant="micro" numberOfLines={1}>
                  {shortName(p.name)}
                </Txt>
              </View>
            ))}
          </View>
        ) : null}
        <Field label="Story title (optional)" value={title} onChangeText={setTitle} max={40} placeholder="e.g. Mutiny on the Gale" />
        <Card>
          {catalog.map((ch, i) => {
            const on = cast.includes(ch.id);
            return (
              <CharacterRow
                key={ch.id}
                character={ch}
                first={i === 0}
                checked={on}
                onPress={() => toggle(ch.id)}
                right={
                  <View
                    style={{ width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: on ? c.link : c.muted, backgroundColor: on ? c.link : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                    {on ? <Icon name="checkmark" size={18} color={c.surface} /> : null}
                  </View>
                }
              />
            );
          })}
        </Card>
      </Scroll>
      <View style={{ padding: 16, paddingBottom: insets.bottom + 12, borderTopWidth: 1, borderTopColor: c.line, backgroundColor: c.bg }}>
        <Button
          label={cast.length < 2 ? 'Pick at least 2 characters' : 'Start the story'}
          disabled={cast.length < 2}
          onPress={() => router.replace(`/chat/${startChat(cast, { title: title.trim() || undefined })}`)}
        />
      </View>
    </Screen>
  );
}
