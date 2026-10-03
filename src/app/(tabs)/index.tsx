import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, View } from 'react-native';

import { Button, IconButton } from '@/components/Button';
import { CharacterRow, CharacterTile } from '@/components/CharacterViews';
import { Chip } from '@/components/Chip';
import { GemPill } from '@/components/GemPill';
import { Card, Screen, SectionTitle, TabHeader } from '@/components/Layout';
import { Txt } from '@/components/Txt';
import { GENRES, ROLES, storyPresets } from '@/data/characters';
import { imageSource } from '@/data/images';
import { useCatalog } from '@/hooks/useCatalog';
import { useStore } from '@/store/useStore';
import { useColors } from '@/theme/useColors';

export default function Discover() {
  const c = useColors();
  const catalog = useCatalog();
  const interests = useStore((s) => s.interests);
  const startChat = useStore((s) => s.startChat);
  const [genre, setGenre] = useState('For you');

  const ranked = useMemo(() => {
    const score = (ch: (typeof catalog)[number]) => [...ch.genres, ...ch.roles].filter((t) => interests.includes(t)).length;
    const list = genre === 'For you' ? [...catalog].sort((a, b) => score(b) - score(a)) : catalog.filter((ch) => ch.genres.includes(genre));
    return list;
  }, [catalog, genre, interests]);

  const trending = ranked.slice(0, 6);
  const more = ranked.slice(6);

  return (
    <Screen>
      <TabHeader
        title="Discover"
        right={
          <>
            <GemPill />
            <IconButton name="search" label="Search characters" onPress={() => router.push('/search')} />
          </>
        }
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingBottom: 12 }}>
          {['For you', ...GENRES].map((g) => (
            <Chip key={g} label={g} selected={genre === g} onPress={() => setGenre(g)} />
          ))}
        </ScrollView>

        <View style={{ paddingHorizontal: 20 }}>
          <SectionTitle action={<Txt variant="label" color={c.link} onPress={() => router.push('/search')}>See all</Txt>}>
            {genre === 'For you' ? 'Picked for you' : genre}
          </SectionTitle>
        </View>
        {trending.length ? (
          <FlatList
            horizontal
            data={trending}
            keyExtractor={(x) => x.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingHorizontal: 20, paddingTop: 14 }}
            renderItem={({ item }) => <CharacterTile character={item} />}
          />
        ) : (
          <Txt secondary style={{ paddingHorizontal: 20, paddingTop: 12 }}>
            No characters in {genre} yet.
          </Txt>
        )}

        <View style={{ paddingHorizontal: 20, marginTop: 24, gap: 12 }}>
          <View style={{ backgroundColor: c.deep, borderRadius: 28, padding: 22, gap: 10 }}>
            <Txt variant="heading" color={c.deepInk}>
              Start a group story
            </Txt>
            <Txt variant="label" color={c.deepInk2}>
              Bring several characters into one chat and see who takes the lead.
            </Txt>
            <Button label="Pick a cast" small style={{ alignSelf: 'flex-start', marginTop: 4 }} onPress={() => router.push('/group/new')} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {storyPresets.map((p) => (
              <Pressable
                key={p.id}
                accessibilityRole="button"
                accessibilityLabel={`Start group story ${p.title}. ${p.tagline}`}
                onPress={() => router.push(`/chat/${startChat(p.characterIds, { presetId: p.id })}`)}
                style={{ width: 240, borderRadius: 24, overflow: 'hidden', backgroundColor: c.surface }}>
                <Image source={imageSource(p.cover)} style={{ width: 240, height: 120 }} contentFit="cover" />
                <View style={{ padding: 12, gap: 2 }}>
                  <Txt weight="medium">{p.title}</Txt>
                  <Txt variant="caption" secondary numberOfLines={1}>
                    {p.tagline}
                  </Txt>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 20, gap: 12 }}>
          <SectionTitle>Browse by role</SectionTitle>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {ROLES.map((r) => (
              <Chip key={r} label={r} onPress={() => router.push({ pathname: '/search', params: { role: r } })} />
            ))}
          </View>
        </View>

        {more.length ? (
          <View style={{ paddingHorizontal: 20, marginTop: 20, gap: 12 }}>
            <SectionTitle>More to meet</SectionTitle>
            <Card>
              {more.map((ch, i) => (
                <CharacterRow key={ch.id} character={ch} first={i === 0} />
              ))}
            </Card>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
