import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button, IconButton } from '@/components/Button';
import { CharacterTile } from '@/components/CharacterViews';
import { Segmented } from '@/components/Form';
import { GemPill } from '@/components/GemPill';
import { Empty, Screen, Scroll, TabHeader } from '@/components/Layout';
import { Txt } from '@/components/Txt';
import { useCatalog } from '@/hooks/useCatalog';
import { useStore } from '@/store/useStore';
import { useColors } from '@/theme/useColors';

type Tab = 'Characters' | 'Liked';

export default function Profile() {
  const c = useColors();
  const persona = useStore((s) => s.personas.find((p) => p.id === s.defaultPersonaId) ?? s.personas[0]);
  const mine = useStore((s) => s.customCharacters);
  const liked = useStore((s) => s.liked);
  const chats = useStore((s) => s.chats.length);
  const catalog = useCatalog();
  const [tab, setTab] = useState<Tab>('Characters');
  const list = tab === 'Characters' ? mine : catalog.filter((x) => liked.includes(x.id));

  return (
    <Screen>
      <TabHeader
        title="Profile"
        right={
          <>
            <GemPill />
            <IconButton name="settings-outline" label="Settings" onPress={() => router.push('/settings')} />
          </>
        }
      />
      <Scroll contentStyle={{ paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Avatar image={persona?.image} name={persona?.name ?? 'You'} size={80} />
          <View style={{ flex: 1, gap: 2 }}>
            <Txt variant="heading">{persona?.name}</Txt>
            <Txt variant="caption" secondary>
              {persona?.pronouns} · default persona
            </Txt>
          </View>
        </View>
        {persona?.bio ? <Txt>{persona.bio}</Txt> : null}
        <View style={{ flexDirection: 'row', backgroundColor: c.surface, borderRadius: 28, paddingVertical: 14 }}>
          {[
            { n: mine.length, l: 'characters' },
            { n: chats, l: 'chats' },
            { n: liked.length, l: 'liked' },
          ].map((s, i) => (
            <View key={s.l} style={{ flex: 1, alignItems: 'center', borderLeftWidth: i ? 1 : 0, borderLeftColor: c.line2 }}>
              <Txt variant="heading">{s.n}</Txt>
              <Txt variant="micro" secondary>
                {s.l}
              </Txt>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button label="My personas" kind="outline" small style={{ flex: 1 }} onPress={() => router.push('/personas')} />
          <Button label="Gems" kind="outline" small style={{ flex: 1 }} onPress={() => router.push('/gems')} />
        </View>
        <Segmented<Tab> label="Profile sections" options={['Characters', 'Liked']} value={tab} onChange={setTab} />
        {list.length ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'space-between' }}>
            {list.map((ch) => (
              <View key={ch.id} style={{ width: '47%' }}>
                <CharacterTile character={ch} width={160} />
                {tab === 'Characters' ? (
                  <Txt variant="micro" color={c.link}>
                    {ch.visibility}
                    {ch.nsfw ? ' · 18+' : ''}
                  </Txt>
                ) : null}
              </View>
            ))}
          </View>
        ) : tab === 'Characters' ? (
          <Empty icon="sparkles-outline" title="No characters yet" body="Create someone new for the world to meet." action={<Button label="Create a character" onPress={() => router.push('/create')} />} />
        ) : (
          <Empty icon="heart-outline" title="Nothing liked yet" body="Tap the heart on a character’s profile to keep them here." />
        )}
      </Scroll>
    </Screen>
  );
}
