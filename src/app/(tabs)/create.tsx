import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { Button, IconButton } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Field, Segmented, ToggleRow } from '@/components/Form';
import { Icon } from '@/components/Icon';
import { Card, Screen } from '@/components/Layout';
import { pickImage } from '@/components/PersonaForm';
import { Txt } from '@/components/Txt';
import { GENRES, MOODS, ROLES, type Character, type Visibility } from '@/data/characters';
import type { ImageRef } from '@/data/images';
import { uid } from '@/lib/id';
import { useStore } from '@/store/useStore';
import { useColors } from '@/theme/useColors';

type Draft = {
  id?: string;
  name: string;
  tagline: string;
  description: string;
  greeting: string;
  scenario: string;
  exampleLines: string;
  tags: string[];
  nsfw: boolean;
  visibility: Visibility;
  definitionPrivate: boolean;
  image?: ImageRef;
};

const EMPTY: Draft = { name: '', tagline: '', description: '', greeting: '', scenario: '', exampleLines: '', tags: [], nsfw: false, visibility: 'Public', definitionPrivate: false };
const VIS_HINT: Record<Visibility, string> = {
  Public: 'Listed in Discover and search. Anyone can start a chat.',
  Unlisted: 'Not listed anywhere. Anyone with the link can chat.',
  Private: 'Only you can chat with them.',
};

function fromCharacter(x: Character): Draft {
  return {
    id: x.id,
    name: x.name,
    tagline: x.tagline,
    description: x.description,
    greeting: x.greeting,
    scenario: x.scenario,
    exampleLines: x.exampleLines ?? '',
    tags: [...x.genres, ...x.roles, ...x.moods],
    nsfw: x.nsfw,
    visibility: x.visibility,
    definitionPrivate: !!x.definitionPrivate,
    image: x.image,
  };
}

export default function Create() {
  const params = useLocalSearchParams<{ edit?: string }>();
  const existing = useStore((s) => (params.edit ? s.customCharacters.find((x) => x.id === params.edit) : undefined));
  // Remount the form whenever the edit target changes so it starts from that character.
  return <CreateForm key={existing?.id ?? 'new'} existing={existing} />;
}

function CreateForm({ existing }: { existing?: Character }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const saveCharacter = useStore((s) => s.saveCharacter);
  const startChat = useStore((s) => s.startChat);
  const [step, setStep] = useState<1 | 2>(1);
  const [d, setD] = useState<Draft>(() => (existing ? fromCharacter(existing) : EMPTY));

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));
  const step1Ok = d.name.trim() && d.tagline.trim() && d.description.trim() && d.greeting.trim();
  const toggleTag = (t: string) => set('tags', d.tags.includes(t) ? d.tags.filter((x) => x !== t) : d.tags.length < 5 ? [...d.tags, t] : d.tags);

  const save = (): Character => {
    const ch: Character = {
      id: d.id ?? uid('char_'),
      name: d.name.trim(),
      tagline: d.tagline.trim(),
      description: d.description.trim(),
      greeting: d.greeting.trim(),
      scenario: d.scenario.trim(),
      exampleLines: d.exampleLines.trim() || undefined,
      genres: d.tags.filter((t) => GENRES.includes(t)).length ? d.tags.filter((t) => GENRES.includes(t)) : ['Slice of life'],
      roles: d.tags.filter((t) => ROLES.includes(t)),
      moods: d.tags.filter((t) => MOODS.includes(t)),
      tags: [],
      nsfw: d.nsfw,
      visibility: d.visibility,
      definitionPrivate: d.definitionPrivate,
      creator: 'you',
      image: d.image,
      own: true,
      createdAt: Date.now(),
    };
    saveCharacter(ch);
    return ch;
  };
  const reset = () => {
    setD(EMPTY);
    setStep(1);
    router.setParams({ edit: undefined });
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center' }}>
          {step === 2 ? <IconButton name="chevron-back" label="Back to basics" onPress={() => setStep(1)} /> : <View style={{ width: 44 }} />}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Txt variant="bodyLg" weight="medium" accessibilityRole="header">
              {d.id ? 'Edit character' : 'New character'}
            </Txt>
            <Txt variant="micro" secondary>
              Step {step} of 2 · {step === 1 ? 'Basics' : 'Story & visibility'}
            </Txt>
          </View>
          {d.id || d.name ? <IconButton name="close" label="Discard changes" onPress={() => Alert.alert('Discard this character?', undefined, [{ text: 'Keep editing', style: 'cancel' }, { text: 'Discard', style: 'destructive', onPress: reset }])} /> : <View style={{ width: 44 }} />}
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
          {step === 1 ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={d.image ? 'Change character image' : 'Add character image'}
                  onPress={async () => {
                    const img = await pickImage();
                    if (img) set('image', img);
                  }}
                  style={{ width: 104, height: 104, borderRadius: 52, borderWidth: d.image ? 0 : 1, borderStyle: 'dashed', borderColor: c.muted, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {d.image ? (
                    <Avatar image={d.image} name={d.name || '?'} size={104} />
                  ) : (
                    <>
                      <Icon name="image-outline" size={26} />
                      <Txt variant="micro" secondary>
                        Add image
                      </Txt>
                    </>
                  )}
                </Pressable>
                <View style={{ flex: 1, gap: 4 }}>
                  <Txt variant="label">Character image</Txt>
                  <Txt variant="caption" secondary>
                    Square works best. Shown on cards, the profile and next to every message.
                  </Txt>
                </View>
              </View>
              <Field label="Name" value={d.name} onChangeText={(t) => set('name', t)} max={40} autoCapitalize="words" />
              <Field label="Tagline" value={d.tagline} onChangeText={(t) => set('tagline', t)} max={60} hint="The hook people see on cards." />
              <Field label="Who are they? Personality, look, backstory" value={d.description} onChangeText={(t) => set('description', t)} multiline max={2000} />
              <Field label="Opening message" value={d.greeting} onChangeText={(t) => set('greeting', t)} multiline max={1000} hint="The first thing they say. Wrap actions in *asterisks*." />
            </>
          ) : (
            <>
              <Field label="Scenario — where the story starts" value={d.scenario} onChangeText={(t) => set('scenario', t)} multiline max={1000} />
              <Field label="Example lines (optional)" value={d.exampleLines} onChangeText={(t) => set('exampleLines', t)} multiline max={1000} placeholder="Show how they talk, so replies stay in voice" />
              <View style={{ gap: 10 }}>
                <Txt variant="caption" secondary style={{ paddingHorizontal: 18 }}>
                  Tags · pick up to 5 ({d.tags.length}/5)
                </Txt>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {[...GENRES, ...ROLES, ...MOODS].map((t) => (
                    <Chip key={t} label={t} selected={d.tags.includes(t)} onPress={() => toggleTag(t)} role="checkbox" />
                  ))}
                </View>
              </View>
              <View style={{ gap: 10 }}>
                <Txt variant="caption" secondary style={{ paddingHorizontal: 18 }}>
                  Content rating
                </Txt>
                <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', gap: 10 }}>
                  {[
                    { nsfw: false, label: 'SFW', hint: 'Fine for everyone. Shown with the safety filter on.' },
                    { nsfw: true, label: 'NSFW · 18+', hint: 'Mature themes. Hidden when the safety filter is on.' },
                  ].map((o) => {
                    const on = d.nsfw === o.nsfw;
                    return (
                      <Pressable
                        key={o.label}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: on }}
                        onPress={() => set('nsfw', o.nsfw)}
                        style={{ flex: 1, padding: 14, borderRadius: 24, gap: 4, backgroundColor: c.surface, borderWidth: 2, borderColor: on ? c.link : c.line }}>
                        <Txt>{o.label}</Txt>
                        <Txt variant="micro" secondary>
                          {o.hint}
                        </Txt>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              <View style={{ gap: 10 }}>
                <Txt variant="caption" secondary style={{ paddingHorizontal: 18 }}>
                  Who can chat with them
                </Txt>
                <Segmented<Visibility> label="Visibility" dark options={['Public', 'Unlisted', 'Private']} value={d.visibility} onChange={(v) => set('visibility', v)} />
                <Txt variant="caption" secondary style={{ paddingHorizontal: 18 }}>
                  {VIS_HINT[d.visibility]}
                </Txt>
              </View>
              <Card>
                <ToggleRow label="Keep definition private" hint="Others can chat, but can’t read the description or scenario" value={d.definitionPrivate} onChange={(v) => set('definitionPrivate', v)} />
              </Card>
            </>
          )}
        </ScrollView>

        <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: c.line, flexDirection: 'row', gap: 10 }}>
          {step === 1 ? (
            <Button label="Next: story & visibility" style={{ flex: 1 }} disabled={!step1Ok} onPress={() => setStep(2)} />
          ) : (
            <>
              <Button
                label="Test chat"
                kind="outline"
                onPress={() => {
                  const ch = save();
                  reset();
                  router.push(`/chat/${startChat([ch.id])}`);
                }}
              />
              <Button
                label={d.id ? 'Save' : 'Publish'}
                style={{ flex: 1 }}
                onPress={() => {
                  const ch = save();
                  reset();
                  router.push(`/character/${ch.id}`);
                }}
              />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
