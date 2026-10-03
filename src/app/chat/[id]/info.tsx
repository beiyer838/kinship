import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, TextInput, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button, IconButton } from '@/components/Button';
import { CharacterRow } from '@/components/CharacterViews';
import { Radio, Segmented } from '@/components/Form';
import { Icon } from '@/components/Icon';
import { Card, Empty, Row, Screen, Scroll, StackHeader } from '@/components/Layout';
import { Sheet } from '@/components/Sheet';
import { Txt } from '@/components/Txt';
import { useCharacters } from '@/hooks/useCatalog';
import { chatTitle, shortName } from '@/lib/format';
import { useStore } from '@/store/useStore';
import type { ReplyLength } from '@/store/types';
import { fonts } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

export default function StoryInfo() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useColors();
  const chat = useStore((s) => s.chats.find((x) => x.id === id));
  const personas = useStore((s) => s.personas);
  const a = useStore.getState();
  const chars = useCharacters(chat?.characterIds ?? []);
  const [memo, setMemo] = useState<{ id?: string; text: string } | null>(null);
  const [pickPersona, setPickPersona] = useState(false);

  if (!chat) {
    return (
      <Screen>
        <StackHeader title="Story info" />
        <Empty icon="chatbubble-outline" title="Chat not found" body="It may have been deleted." />
      </Screen>
    );
  }
  const persona = personas.find((p) => p.id === chat.personaId) ?? personas[0];
  const title = chatTitle(chat, chars);
  const group = chat.characterIds.length > 1;

  return (
    <Screen>
      <StackHeader title="Story info" />
      <Scroll>
        <View style={{ alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <Pressable accessibilityRole="button" accessibilityLabel={group ? title : `View ${title}'s profile`} disabled={group} onPress={() => router.push(`/character/${chat.characterIds[0]}`)}>
            <Avatar image={chat.cover ?? chars[0]?.image} name={title} size={96} />
          </Pressable>
          <Txt variant="heading" center>
            {title}
          </Txt>
          <Txt variant="caption" secondary center>
            {group ? `${chars.length} characters` : `by ${chars[0]?.own ? 'you' : chars[0]?.creator}`}
          </Txt>
        </View>

        <Card style={{ paddingVertical: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Txt weight="medium">
              Pinned memories <Txt secondary>· {chat.memories.length}</Txt>
            </Txt>
            <Button label="Add" kind="soft" small icon="add" onPress={() => setMemo({ text: '' })} />
          </View>
          <Txt variant="caption" secondary style={{ marginTop: 4, marginBottom: 6 }}>
            {group ? 'Everyone in this story' : shortName(chars[0]?.name ?? '')} always remembers these, even deep into a long story.
          </Txt>
          {chat.memories.length === 0 ? (
            <Txt variant="caption" secondary style={{ paddingVertical: 8 }}>
              Nothing pinned yet. Long-press a message and choose Pin to memory, or add one here.
            </Txt>
          ) : (
            chat.memories.map((m) => (
              <View key={m.id} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start', paddingVertical: 10, borderTopWidth: 1, borderTopColor: c.line2 }}>
                <View style={{ marginTop: 2 }}>
                  <Icon name="pin" size={16} color={c.link} />
                </View>
                <Txt variant="label" style={{ flex: 1 }}>
                  {m.text.replace(/\*/g, '')}
                </Txt>
                <IconButton name="create-outline" label="Edit memory" size={32} color={c.ink2} onPress={() => setMemo({ id: m.id, text: m.text })} />
                <IconButton name="close" label="Remove memory" size={32} color={c.ink2} onPress={() => a.removeMemory(chat.id, m.id)} />
              </View>
            ))
          )}
        </Card>

        <Card>
          <Pressable accessibilityRole="button" onPress={() => setPickPersona(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }}>
            <Avatar image={persona?.image} name={persona?.name ?? '?'} size={40} />
            <View style={{ flex: 1 }}>
              <Txt variant="caption" secondary>
                Playing as
              </Txt>
              <Txt>
                {persona?.name} <Txt secondary variant="caption">{persona?.pronouns}</Txt>
              </Txt>
            </View>
            <Txt variant="label" color={c.link}>
              Change
            </Txt>
          </Pressable>
        </Card>

        <Card style={{ paddingVertical: 14 }}>
          <Txt weight="medium" style={{ marginBottom: 6 }}>
            Story paths
          </Txt>
          <View accessibilityRole="radiogroup">
            {chat.paths.map((p, i) => {
              const on = p.id === chat.activePathId;
              return (
                <Pressable
                  key={p.id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on }}
                  onPress={() => a.switchPath(chat.id, p.id)}
                  style={{ flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: c.line2 }}>
                  <Radio checked={on} />
                  <View style={{ flex: 1 }}>
                    <Txt variant="label">{p.name}</Txt>
                    <Txt variant="caption" secondary numberOfLines={1}>
                      {on ? 'Current · ' : ''}
                      {p.branchedAt ? `Branched at ${p.branchedAt} · ` : ''}
                      {p.messages.length} messages
                    </Txt>
                  </View>
                </Pressable>
              );
            })}
          </View>
          <Txt variant="micro" secondary style={{ marginTop: 6 }}>
            Long-press any message and choose Start a new path to branch the story.
          </Txt>
        </Card>

        <Card style={{ paddingVertical: 14, gap: 10 }}>
          <Txt weight="medium">Reply length</Txt>
          <Segmented<ReplyLength> label="Reply length" options={['Short', 'Balanced', 'Long']} value={chat.replyLength} onChange={(v) => a.setReplyLength(chat.id, v)} />
        </Card>

        {group ? (
          <Card>
            <Txt weight="medium" style={{ paddingTop: 10 }}>
              Cast
            </Txt>
            {chars.map((ch, i) => (
              <CharacterRow key={ch.id} character={ch} first={i === 0} />
            ))}
          </Card>
        ) : null}

        <Card>
          <Row
            first
            icon="refresh-outline"
            label="Start over from the greeting"
            onPress={() =>
              Alert.alert('Start over?', 'This clears the current path back to the opening message. Other paths stay.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Start over', style: 'destructive', onPress: () => a.restartChat(chat.id) },
              ])
            }
          />
          {!group && chars[0] && !chars[0].own ? (
            <Row
              icon="flag-outline"
              label={`Report ${chars[0].name}`}
              danger
              onPress={() => {
                a.report('character', chars[0].id, 'Reported from story info');
                Alert.alert('Thanks for telling us', 'We review every report.');
              }}
            />
          ) : null}
          <Row
            icon="trash-outline"
            label="Delete chat"
            danger
            onPress={() =>
              Alert.alert('Delete this chat?', 'All story paths and memories in it will be deleted.', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    a.deleteChat(chat.id);
                    router.replace('/chats');
                  },
                },
              ])
            }
          />
        </Card>
      </Scroll>

      <Sheet visible={!!memo} onClose={() => setMemo(null)} title={memo?.id ? 'Edit memory' : 'Add a memory'}>
        <TextInput
          accessibilityLabel="Memory"
          autoFocus
          multiline
          value={memo?.text}
          onChangeText={(t) => setMemo((m) => (m ? { ...m, text: t } : m))}
          placeholder="e.g. Wren is afraid of heights"
          placeholderTextColor={c.muted}
          style={{ minHeight: 96, borderRadius: 20, borderWidth: 1, borderColor: c.line, backgroundColor: c.bg, padding: 14, textAlignVertical: 'top', color: c.ink, fontFamily: fonts.regular, fontSize: 16 }}
        />
        <Button
          label="Save"
          style={{ marginTop: 12 }}
          disabled={!memo?.text.trim()}
          onPress={() => {
            if (!memo) return;
            if (memo.id) a.editMemory(chat.id, memo.id, memo.text.trim());
            else a.addMemory(chat.id, memo.text.trim());
            setMemo(null);
          }}
        />
      </Sheet>

      <Sheet visible={pickPersona} onClose={() => setPickPersona(false)} title="Play as">
        {personas.map((p, i) => (
          <Pressable
            key={p.id}
            accessibilityRole="radio"
            accessibilityState={{ checked: p.id === chat.personaId }}
            onPress={() => {
              a.setChatPersona(chat.id, p.id);
              setPickPersona(false);
            }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 8, borderTopWidth: i ? 1 : 0, borderTopColor: c.line2 }}>
            <Avatar image={p.image} name={p.name} size={40} />
            <View style={{ flex: 1 }}>
              <Txt>{p.name}</Txt>
              <Txt variant="caption" secondary numberOfLines={1}>
                {p.bio || p.pronouns}
              </Txt>
            </View>
            <Radio checked={p.id === chat.personaId} />
          </Pressable>
        ))}
        <Button label="Manage personas" kind="soft" style={{ marginTop: 12 }} onPress={() => { setPickPersona(false); router.push('/personas'); }} />
      </Sheet>
    </Screen>
  );
}
