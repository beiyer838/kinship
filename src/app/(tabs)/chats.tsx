import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, TextInput, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button, IconButton } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { GemPill } from '@/components/GemPill';
import { Icon } from '@/components/Icon';
import { Empty, Row, Screen, TabHeader } from '@/components/Layout';
import { Sheet } from '@/components/Sheet';
import { previewText } from '@/components/StoryText';
import { Txt } from '@/components/Txt';
import type { Character } from '@/data/characters';
import { chatTime, chatTitle, shortName } from '@/lib/format';
import { activePath, findCharacter, messageText, useStore } from '@/store/useStore';
import type { Chat } from '@/store/types';
import { fonts } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

type Filter = 'All' | 'Unread' | 'Groups' | 'Pinned';

export default function Chats() {
  const c = useColors();
  const chats = useStore((s) => s.chats);
  const custom = useStore((s) => s.customCharacters);
  const personas = useStore((s) => s.personas);
  const togglePin = useStore((s) => s.togglePinChat);
  const deleteChat = useStore((s) => s.deleteChat);
  const [filter, setFilter] = useState<Filter>('All');
  const [q, setQ] = useState('');
  const [menuFor, setMenuFor] = useState<Chat | null>(null);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return [...chats]
      .sort((a, b) => Number(!!b.pinnedChat) - Number(!!a.pinnedChat) || b.updatedAt - a.updatedAt)
      .map((chat) => {
        const chars = chat.characterIds.map((id) => findCharacter(id, custom)).filter((x): x is Character => !!x);
        const msgs = activePath(chat).messages;
        const last = msgs[msgs.length - 1];
        const who = last ? (last.role === 'user' ? 'You' : chat.characterIds.length > 1 ? shortName(chars.find((x) => x.id === last.characterId)?.name ?? '') : null) : null;
        return { chat, chars, title: chatTitle(chat, chars), preview: last ? `${who ? `${who}: ` : ''}${previewText(messageText(last))}` : 'Say hello' };
      })
      .filter(({ chat, title, preview }) => {
        if (filter === 'Unread' && !chat.unread) return false;
        if (filter === 'Groups' && chat.characterIds.length < 2) return false;
        if (filter === 'Pinned' && !chat.pinnedChat) return false;
        return !needle || title.toLowerCase().includes(needle) || preview.toLowerCase().includes(needle);
      });
  }, [chats, custom, filter, q]);

  return (
    <Screen bg={c.surface}>
      <TabHeader
        title="Chats"
        right={
          <>
            <GemPill />
            <IconButton name="add" label="New chat" bg={c.accent} color={c.onAccent} onPress={() => router.push('/')} />
          </>
        }
      />
      {chats.length ? (
        <>
          <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
            <View style={{ height: 40, borderRadius: 20, backgroundColor: c.fill, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 8 }}>
              <Icon name="search" size={18} color={c.ink2} />
              <TextInput
                accessibilityLabel="Search chats"
                placeholder="Search chats"
                placeholderTextColor={c.muted}
                value={q}
                onChangeText={setQ}
                style={{ flex: 1, color: c.ink, fontFamily: fonts.regular, fontSize: 16 }}
              />
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingBottom: 6 }} style={{ flexGrow: 0 }}>
            {(['All', 'Unread', 'Groups', 'Pinned'] as Filter[]).map((f) => (
              <Chip key={f} label={f} selected={filter === f} onPress={() => setFilter(f)} />
            ))}
          </ScrollView>
          <FlatList
            data={rows}
            keyExtractor={(r) => r.chat.id}
            contentContainerStyle={{ paddingBottom: 24 }}
            ListEmptyComponent={<Txt secondary center style={{ padding: 32 }}>Nothing matches.</Txt>}
            renderItem={({ item: { chat, chars, title, preview } }) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${title}. ${preview}${chat.unread ? `. ${chat.unread} unread` : ''}`}
                accessibilityHint="Long press for options"
                onPress={() => router.push(`/chat/${chat.id}`)}
                onLongPress={() => setMenuFor(chat)}
                style={({ pressed }) => ({ flexDirection: 'row', gap: 14, paddingHorizontal: 20, paddingTop: 10, opacity: pressed ? 0.6 : 1 })}>
                <Avatar image={chat.cover ?? chars[0]?.image} name={title} size={54} />
                <View style={{ flex: 1, gap: 4, borderBottomWidth: 1, borderBottomColor: c.line2, paddingBottom: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                    <Txt variant="bodyLg" weight="medium" numberOfLines={1} style={{ flex: 1 }}>
                      {title}
                    </Txt>
                    <Txt variant="micro" color={chat.unread ? c.link : c.ink2}>
                      {chatTime(chat.updatedAt)}
                    </Txt>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Txt variant="label" secondary numberOfLines={2} style={{ flex: 1 }}>
                      {preview}
                    </Txt>
                    {chat.pinnedChat ? <Icon name="pin" size={14} color={c.ink2} /> : null}
                    {chat.unread ? (
                      <View style={{ minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' }}>
                        <Txt variant="micro" weight="semibold" color={c.onAccent}>
                          {chat.unread}
                        </Txt>
                      </View>
                    ) : null}
                  </View>
                  <Txt variant="micro" secondary numberOfLines={1}>
                    as {personas.find((p) => p.id === chat.personaId)?.name ?? 'you'}
                  </Txt>
                </View>
              </Pressable>
            )}
          />
        </>
      ) : (
        <Empty
          icon="chatbubbles-outline"
          title="No chats yet"
          body="Find a character in Discover, or start a group story with a whole cast."
          action={<Button label="Find someone to talk to" onPress={() => router.push('/')} style={{ marginTop: 8 }} />}
        />
      )}
      <Sheet visible={!!menuFor} onClose={() => setMenuFor(null)}>
        {menuFor ? (
          <>
            <Row first icon={menuFor.pinnedChat ? 'pin-outline' : 'pin'} label={menuFor.pinnedChat ? 'Unpin chat' : 'Pin chat'} onPress={() => { togglePin(menuFor.id); setMenuFor(null); }} />
            <Row
              icon="trash-outline"
              label="Delete chat"
              danger
              onPress={() => {
                const target = menuFor;
                setMenuFor(null);
                Alert.alert('Delete this chat?', 'All story paths and memories in it will be deleted.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => deleteChat(target.id) },
                ]);
              }}
            />
          </>
        ) : null}
      </Sheet>
    </Screen>
  );
}
