import * as Clipboard from 'expo-clipboard';
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { Button, IconButton, tap } from '@/components/Button';
import { CharacterRow } from '@/components/CharacterViews';
import { CrisisSheet } from '@/components/CrisisSheet';
import { Icon, type IconName } from '@/components/Icon';
import { Card, Empty, goBack, Screen } from '@/components/Layout';
import { MessageBubble, TypingBubble } from '@/components/MessageBubble';
import { Sheet } from '@/components/Sheet';
import { Txt } from '@/components/Txt';
import { useCatalog, useCharacters } from '@/hooks/useCatalog';
import { looksLikeRisk, pickSpeaker, requestReply } from '@/lib/ai';
import { GEMS } from '@/lib/economy';
import { chatTitle, shortName } from '@/lib/format';
import { activePath, messageText, useStore } from '@/store/useStore';
import type { Message } from '@/store/types';
import { fonts } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

type Job = { mode: 'reply' | 'continue'; speakerId: string; regenFor?: string };

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const chat = useStore((s) => s.chats.find((x) => x.id === id));
  const persona = useStore((s) => s.personas.find((p) => p.id === chat?.personaId) ?? s.personas[0]);
  const gems = useStore((s) => s.gems);
  const actions = useStore.getState();
  const chars = useCharacters(chat?.characterIds ?? []);
  const catalog = useCatalog();

  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState<Job | null>(null);
  const [error, setError] = useState<{ message: string; job: Job } | null>(null);
  const [selected, setSelected] = useState<Message | null>(null);
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null);
  const [crisis, setCrisis] = useState(false);
  const [adding, setAdding] = useState(false);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      if (id) useStore.getState().markRead(id);
    }, [id]),
  );

  const group = (chat?.characterIds.length ?? 0) > 1;
  const messages = useMemo(() => (chat ? activePath(chat).messages : []), [chat]);
  const lastChar = [...messages].reverse().find((m) => m.role === 'character');
  const nameColor = (charId?: string) => c.names[Math.max(0, chat?.characterIds.indexOf(charId ?? '') ?? 0) % c.names.length];
  const reversed = useMemo(() => [...messages].reverse(), [messages]);

  const run = useCallback(
    async (job: Job) => {
      const state = useStore.getState();
      const current = state.chats.find((x) => x.id === id);
      if (!current || busy) return;
      if (state.gems < GEMS.perReply) {
        Alert.alert('Out of gems', `Each reply uses ${GEMS.perReply} gems. Claim your free daily gems or top up.`, [
          { text: 'Not now', style: 'cancel' },
          { text: 'Get gems', onPress: () => router.push('/gems') },
        ]);
        return;
      }
      setBusy(job);
      setError(null);
      try {
        const path = activePath(current);
        const idx = job.regenFor ? path.messages.findIndex((m) => m.id === job.regenFor) : -1;
        const text = await requestReply({
          chat: current,
          persona: state.personas.find((p) => p.id === current.personaId) ?? state.personas[0],
          custom: state.customCharacters,
          speakerId: job.speakerId,
          history: idx >= 0 ? path.messages.slice(0, idx) : path.messages,
          mode: job.mode,
          safe: state.safetyFilter,
        });
        const s = useStore.getState();
        s.spendGems(GEMS.perReply);
        if (job.regenFor) s.addAlternative(current.id, job.regenFor, text);
        else s.appendMessage(current.id, { role: 'character', characterId: job.speakerId, alts: [text] });
        if (!navigation.isFocused()) s.bumpUnread(current.id);
      } catch (e) {
        setError({ message: e instanceof Error ? e.message : 'Something went wrong.', job });
      } finally {
        setBusy(null);
      }
    },
    [busy, id, navigation],
  );

  if (!chat) {
    return (
      <Screen style={{ paddingTop: insets.top }}>
        <Empty icon="chatbubble-outline" title="Chat not found" body="It may have been deleted." action={<Button label="Back to chats" kind="outline" onPress={() => router.replace('/chats')} />} />
      </Screen>
    );
  }

  const title = chatTitle(chat, chars);
  const send = () => {
    const text = draft.trim();
    if (!text || busy) return;
    if (looksLikeRisk(text)) setCrisis(true);
    actions.appendMessage(chat.id, { role: 'user', alts: [text] });
    setDraft('');
    const fresh = useStore.getState().chats.find((x) => x.id === chat.id) ?? chat;
    run({ mode: 'reply', speakerId: pickSpeaker(fresh, chars, text) });
  };
  const continueStory = () => {
    const speakerId = group ? pickSpeaker(chat, chars, '') : chat.characterIds[0];
    run({ mode: 'continue', speakerId });
  };
  const regenerate = (m: Message) => {
    if (m.role !== 'character' || !m.characterId) return;
    run({ mode: 'reply', speakerId: m.characterId, regenFor: m.id });
  };
  const swipe = (m: Message, dir: -1 | 1) => {
    const next = m.alt + dir;
    if (next < 0) return;
    if (next < m.alts.length) actions.setAlternative(chat.id, m.id, next);
    else if (m.id === lastChar?.id) regenerate(m);
  };

  const sheetActions: { icon: IconName; label: string; hint?: string; danger?: boolean; show: boolean; onPress: (m: Message) => void }[] = [
    { icon: 'pin-outline', label: 'Pin to memory', hint: 'They will always remember this', show: true, onPress: (m) => actions.pinMessage(chat.id, m.id) },
    { icon: 'create-outline', label: 'Edit message', show: true, onPress: (m) => setEditing({ id: m.id, text: messageText(m) }) },
    { icon: 'git-branch-outline', label: 'Start a new path from here', hint: 'The original story stays saved', show: true, onPress: (m) => actions.branchFrom(chat.id, m.id) },
    { icon: 'refresh-outline', label: 'Rewrite reply', hint: `Uses ${GEMS.perReply} gems`, show: selected?.role === 'character', onPress: regenerate },
    { icon: 'play-back-outline', label: 'Rewind to here', hint: 'Removes everything after this message', show: true, onPress: (m) => actions.rewindTo(chat.id, m.id) },
    { icon: 'copy-outline', label: 'Copy text', show: true, onPress: (m) => Clipboard.setStringAsync(messageText(m)).catch(() => {}) },
    {
      icon: 'flag-outline',
      label: 'Report message',
      danger: true,
      show: selected?.role === 'character',
      onPress: (m) => {
        actions.report('message', m.id, messageText(m).slice(0, 500));
        Alert.alert('Thanks for telling us', 'We review every report.');
      },
    },
    { icon: 'trash-outline', label: 'Delete message', danger: true, show: true, onPress: (m) => actions.deleteMessage(chat.id, m.id) },
  ];

  const speaking = busy ? chars.find((x) => x.id === busy.speakerId) : undefined;

  return (
    <Screen bg={c.wall}>
      <View style={{ backgroundColor: c.surface, borderBottomWidth: 1, borderBottomColor: c.line, paddingTop: insets.top + 4, paddingBottom: 6, paddingHorizontal: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <IconButton name="chevron-back" label="Back to chats" onPress={() => goBack('/chats')} />
        <Pressable accessibilityRole="button" accessibilityLabel={`${title}. Story info`} onPress={() => router.push(`/chat/${chat.id}/info`)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Avatar image={chat.cover ?? chars[0]?.image} name={title} size={38} />
          <View style={{ flex: 1 }}>
            <Txt variant="bodyLg" weight="medium" numberOfLines={1}>
              {title}
            </Txt>
            <Txt variant="micro" secondary numberOfLines={1}>
              {group ? `${chars.map((x) => shortName(x.name)).join(', ')}, you as ${persona?.name}` : `Playing as ${persona?.name} · tap for story info`}
            </Txt>
          </View>
        </Pressable>
        <IconButton name="pin-outline" label="Pinned memories" onPress={() => router.push(`/chat/${chat.id}/info`)} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          inverted
          data={reversed}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 12 }}
          ListHeaderComponent={
            <View>
              {busy && !busy.regenFor ? <TypingBubble name={speaking?.name} group={group} /> : null}
              {error ? (
                <View style={{ alignSelf: 'center', marginTop: 8, backgroundColor: c.dangerFill, borderRadius: 18, padding: 12, gap: 8, maxWidth: '92%' }}>
                  <Txt variant="caption" color={c.danger}>
                    {error.message}
                  </Txt>
                  <Button label="Try again" kind="danger" small onPress={() => run(error.job)} />
                </View>
              ) : null}
            </View>
          }
          ListFooterComponent={
            <View style={{ alignSelf: 'center', maxWidth: 320, backgroundColor: c.notice, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8, marginBottom: 10 }}>
              <Txt variant="micro" center>
                Characters are fictional and can be wrong. Long-press any message to pin it, edit it or branch the story.
              </Txt>
            </View>
          }
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              character={chars.find((x) => x.id === item.characterId)}
              nameColor={nameColor(item.characterId)}
              group={group}
              showSwipe={item.id === lastChar?.id && item.id === messages[messages.length - 1]?.id}
              canGenerate={item.id === lastChar?.id && !busy}
              onLongPress={() => {
                tap();
                setSelected(item);
              }}
              onPrev={() => swipe(item, -1)}
              onNext={() => swipe(item, 1)}
            />
          )}
        />

        <View style={{ backgroundColor: c.bg, borderTopWidth: 1, borderTopColor: c.line, paddingHorizontal: 10, paddingTop: 8, paddingBottom: insets.bottom + 8, gap: 8 }}>
          {group ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, alignItems: 'center' }} accessibilityRole="radiogroup" accessibilityLabel="Who replies next">
              <Txt variant="micro" secondary style={{ marginRight: 2 }}>
                Who replies next
              </Txt>
              {['auto', ...chat.characterIds].map((sid) => {
                const on = chat.nextSpeaker === sid;
                const label = sid === 'auto' ? 'Auto' : shortName(chars.find((x) => x.id === sid)?.name ?? sid);
                return (
                  <Pressable
                    key={sid}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: on }}
                    onPress={() => actions.setNextSpeaker(chat.id, sid)}
                    style={{ height: 32, paddingHorizontal: 12, borderRadius: 16, justifyContent: 'center', backgroundColor: on ? c.ink : c.surface, borderWidth: 1, borderColor: on ? c.ink : c.line }}>
                    <Txt variant="caption" color={on ? c.bg : c.ink}>
                      {label}
                    </Txt>
                  </Pressable>
                );
              })}
              <Pressable accessibilityRole="button" accessibilityLabel="Add a character" onPress={() => setAdding(true)} style={{ height: 32, paddingHorizontal: 12, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderStyle: 'dashed', borderColor: c.muted }}>
                <Icon name="add" size={14} />
                <Txt variant="caption">Add</Txt>
              </Pressable>
            </ScrollView>
          ) : null}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            <QuickAction icon="play-forward-outline" label="Continue" disabled={!!busy} onPress={continueStory} />
            {lastChar ? <QuickAction icon="refresh-outline" label="Rewrite reply" disabled={!!busy} onPress={() => regenerate(lastChar)} /> : null}
            <QuickAction icon="person-circle-outline" label={persona?.name ?? 'Persona'} onPress={() => router.push(`/chat/${chat.id}/info`)} />
            <QuickAction icon="diamond-outline" label={`${gems.toLocaleString()} gems`} onPress={() => router.push('/gems')} />
          </ScrollView>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
            <View style={{ flex: 1, minHeight: 44, borderRadius: 22, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 4 }}>
              <TextInput
                accessibilityLabel={`Message ${title}`}
                placeholder={`Message ${group ? 'the group' : shortName(chars[0]?.name ?? '')}…`}
                placeholderTextColor={c.muted}
                value={draft}
                onChangeText={setDraft}
                multiline
                style={{ flex: 1, maxHeight: 120, paddingVertical: 10, color: c.ink, fontFamily: fonts.regular, fontSize: 16 }}
              />
              <Pressable accessibilityRole="button" accessibilityLabel="Add an action in italics" onPress={() => setDraft((d) => `${d}${d && !d.endsWith(' ') ? ' ' : ''}**`)} style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
                <Txt variant="heading" italic secondary>
                  *
                </Txt>
              </Pressable>
            </View>
            <IconButton name="send" label="Send" size={46} bg={draft.trim() && !busy ? c.accent : c.fill} color={draft.trim() && !busy ? c.onAccent : c.muted} onPress={send} />
          </View>
        </View>
      </KeyboardAvoidingView>

      <Sheet visible={!!selected} onClose={() => setSelected(null)}>
        {sheetActions
          .filter((a) => a.show)
          .map((a, i) => (
            <Pressable
              key={a.label}
              accessibilityRole="button"
              onPress={() => {
                const m = selected;
                setSelected(null);
                if (m) a.onPress(m);
              }}
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 52, paddingHorizontal: 8, paddingVertical: 6, borderTopWidth: a.danger && !sheetActions.filter((x) => x.show)[i - 1]?.danger ? 1 : 0, borderTopColor: c.line2, opacity: pressed ? 0.6 : 1 })}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: a.danger ? c.dangerFill : c.fill, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={a.icon} size={20} color={a.danger ? c.danger : c.ink} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt color={a.danger ? c.danger : c.ink}>{a.label}</Txt>
                {a.hint ? (
                  <Txt variant="caption" secondary>
                    {a.hint}
                  </Txt>
                ) : null}
              </View>
            </Pressable>
          ))}
      </Sheet>

      <Sheet visible={!!editing} onClose={() => setEditing(null)} title="Edit message">
        <TextInput
          accessibilityLabel="Message text"
          value={editing?.text}
          onChangeText={(t) => setEditing((e) => (e ? { ...e, text: t } : e))}
          multiline
          autoFocus
          style={{ minHeight: 120, maxHeight: 280, borderRadius: 20, borderWidth: 1, borderColor: c.line, backgroundColor: c.bg, padding: 14, textAlignVertical: 'top', color: c.ink, fontFamily: fonts.regular, fontSize: 16 }}
        />
        <Txt variant="micro" secondary style={{ marginTop: 6, marginHorizontal: 8 }}>
          Wrap actions in *asterisks*.
        </Txt>
        <Button
          label="Save"
          style={{ marginTop: 12 }}
          disabled={!editing?.text.trim()}
          onPress={() => {
            if (editing) actions.editMessage(chat.id, editing.id, editing.text.trim());
            setEditing(null);
          }}
        />
      </Sheet>

      <Sheet visible={adding} onClose={() => setAdding(false)} title="Add to this story">
        <ScrollView style={{ maxHeight: 420 }}>
          <Card>
            {catalog
              .filter((x) => !chat.characterIds.includes(x.id))
              .map((x, i) => (
                <CharacterRow
                  key={x.id}
                  character={x}
                  first={i === 0}
                  onPress={() => {
                    actions.addCharacterToChat(chat.id, x.id);
                    setAdding(false);
                  }}
                  right={<Icon name="add-circle" size={26} color={c.link} />}
                />
              ))}
          </Card>
        </ScrollView>
      </Sheet>

      <CrisisSheet visible={crisis} onClose={() => setCrisis(false)} />
    </Screen>
  );
}

function QuickAction({ icon, label, onPress, disabled }: { icon: IconName; label: string; onPress: () => void; disabled?: boolean }) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => ({ height: 34, paddingHorizontal: 12, borderRadius: 17, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, opacity: disabled ? 0.45 : pressed ? 0.7 : 1 })}>
      <Icon name={icon} size={15} />
      <Txt variant="caption">{label}</Txt>
    </Pressable>
  );
}
