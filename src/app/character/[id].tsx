import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Share, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, initials } from '@/components/Avatar';
import { Button, IconButton } from '@/components/Button';
import { Empty, goBack, Row, Screen } from '@/components/Layout';
import { Sheet } from '@/components/Sheet';
import { StoryText } from '@/components/StoryText';
import { Txt } from '@/components/Txt';
import { imageSource } from '@/data/images';
import { useCatalog, useCharacter } from '@/hooks/useCatalog';
import { useStore } from '@/store/useStore';
import { useColors } from '@/theme/useColors';
import { shortName } from '@/lib/format';

export default function CharacterScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const ch = useCharacter(id);
  const catalog = useCatalog();
  const liked = useStore((s) => (id ? s.liked.includes(id) : false));
  const toggleLike = useStore((s) => s.toggleLike);
  const existing = useStore((s) => s.chats.find((x) => x.characterIds.length === 1 && x.characterIds[0] === id));
  const startChat = useStore((s) => s.startChat);
  const block = useStore((s) => s.block);
  const report = useStore((s) => s.report);
  const deleteCharacter = useStore((s) => s.deleteCharacter);
  const [menu, setMenu] = useState(false);

  if (!ch) {
    return (
      <Screen style={{ paddingTop: insets.top }}>
        <Empty icon="person-outline" title="Character not found" body="They may have been removed or blocked." action={<Button label="Back" kind="outline" onPress={() => goBack()} />} />
      </Screen>
    );
  }

  const src = imageSource(ch.image);
  const similar = catalog.filter((x) => x.id !== ch.id && x.genres.some((g) => ch.genres.includes(g))).slice(0, 6);
  const newChat = () => router.push(`/chat/${startChat([ch.id])}`);

  return (
    <Screen bg={c.surface}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={{ height: 360, backgroundColor: c.soft, alignItems: 'center', justifyContent: 'center' }}>
          {src ? (
            <Image source={src} style={{ width: '100%', height: '100%' }} contentFit="cover" contentPosition="top" accessibilityLabel={`Portrait of ${ch.name}`} />
          ) : (
            <Txt style={{ fontSize: 96, lineHeight: 110 }} color={c.softInk}>
              {initials(ch.name)}
            </Txt>
          )}
          <View style={{ position: 'absolute', top: insets.top + 8, left: 16, right: 16, flexDirection: 'row', gap: 8 }}>
            <IconButton name="chevron-back" label="Back" bg={c.surface} onPress={() => goBack()} />
            <View style={{ flex: 1 }} />
            <IconButton
              name="share-outline"
              label="Share character"
              bg={c.surface}
              onPress={() => Share.share({ message: `Chat with ${ch.name} on Kinship: ${ch.tagline}` }).catch(() => {})}
            />
            <IconButton name="ellipsis-horizontal" label="More options" bg={c.surface} onPress={() => setMenu(true)} />
          </View>
        </View>

        <View style={{ marginTop: -32, backgroundColor: c.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 20, gap: 16 }}>
          <View style={{ gap: 6 }}>
            <Txt variant="title" accessibilityRole="header">
              {ch.name}
            </Txt>
            <Txt secondary>{ch.tagline}</Txt>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Avatar name={ch.own ? 'You' : ch.creator.replace('@', '')} size={32} />
            <Txt variant="label" style={{ flex: 1 }}>
              {ch.own ? 'Made by you' : `by ${ch.creator}`}
            </Txt>
            <View style={{ paddingHorizontal: 12, height: 28, borderRadius: 14, justifyContent: 'center', backgroundColor: ch.nsfw ? c.dangerFill : c.soft }}>
              <Txt variant="micro" weight="semibold" color={ch.nsfw ? c.danger : c.softInk}>
                {ch.nsfw ? '18+' : 'SFW'}
              </Txt>
            </View>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {[...ch.genres, ...ch.tags].map((t) => (
              <View key={t} style={{ paddingHorizontal: 12, height: 32, borderRadius: 16, justifyContent: 'center', backgroundColor: c.fill }}>
                <Txt variant="caption">{t}</Txt>
              </View>
            ))}
          </View>

          <View style={{ gap: 8 }}>
            <Txt variant="heading" accessibilityRole="header">
              About
            </Txt>
            <Txt>{ch.definitionPrivate && !ch.own ? 'The creator keeps this character’s definition private. Start a chat to meet them.' : ch.description}</Txt>
          </View>
          <View style={{ gap: 10 }}>
            <Txt variant="heading" accessibilityRole="header">
              How it starts
            </Txt>
            <View style={{ backgroundColor: c.wall, borderRadius: 28, padding: 14 }}>
              <View style={{ alignSelf: 'flex-start', maxWidth: '92%', backgroundColor: c.bubbleIn, borderRadius: 18, borderBottomLeftRadius: 6, paddingHorizontal: 12, paddingVertical: 8 }}>
                <StoryText text={ch.greeting} size={15} />
              </View>
            </View>
          </View>
          {similar.length ? (
            <View style={{ gap: 10 }}>
              <Txt variant="heading" accessibilityRole="header">
                Similar characters
              </Txt>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
                {similar.map((s) => (
                  <Pressable key={s.id} accessibilityRole="button" accessibilityLabel={s.name} onPress={() => router.push(`/character/${s.id}`)} style={{ width: 72, alignItems: 'center', gap: 6 }}>
                    <Avatar image={s.image} name={s.name} size={64} />
                    <Txt variant="caption" numberOfLines={1}>
                      {shortName(s.name)}
                    </Txt>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.line, padding: 12, paddingHorizontal: 16, paddingBottom: insets.bottom + 12, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <IconButton name={liked ? 'heart' : 'heart-outline'} label={liked ? `Unlike ${ch.name}` : `Like ${ch.name}`} size={52} color={liked ? c.danger : c.ink} bg={c.fill} onPress={() => toggleLike(ch.id)} />
        <IconButton name="people-outline" label={`Add ${ch.name} to a group story`} size={52} bg={c.fill} onPress={() => router.push({ pathname: '/group/new', params: { with: ch.id } })} />
        <Button label={existing ? 'Continue chat' : 'Start chat'} style={{ flex: 1 }} onPress={() => (existing ? router.push(`/chat/${existing.id}`) : newChat())} />
      </View>

      <Sheet visible={menu} onClose={() => setMenu(false)}>
        {existing ? <Row first icon="add-circle-outline" label="Start a new chat" onPress={() => { setMenu(false); newChat(); }} /> : null}
        {ch.own ? (
          <>
            <Row first={!existing} icon="create-outline" label="Edit character" onPress={() => { setMenu(false); router.push({ pathname: '/create', params: { edit: ch.id } }); }} />
            <Row
              icon="trash-outline"
              label="Delete character"
              danger
              onPress={() =>
                Alert.alert(`Delete ${ch.name}?`, 'Their chats will be deleted too. This can’t be undone.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => { setMenu(false); deleteCharacter(ch.id); goBack(); } },
                ])
              }
            />
          </>
        ) : (
          <>
            <Row first={!existing} icon="flag-outline" label="Report character" onPress={() => { report('character', ch.id, 'Reported from profile'); setMenu(false); Alert.alert('Thanks for telling us', 'Our team reviews every report.'); }} />
            <Row
              icon="ban-outline"
              label={`Block ${ch.name}`}
              danger
              onPress={() => {
                block(ch.id);
                setMenu(false);
                goBack();
              }}
            />
          </>
        )}
      </Sheet>
    </Screen>
  );
}
