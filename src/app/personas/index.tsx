import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button, IconButton } from '@/components/Button';
import { Radio } from '@/components/Form';
import { Icon } from '@/components/Icon';
import { Screen, Scroll, StackHeader } from '@/components/Layout';
import { Txt } from '@/components/Txt';
import { useStore } from '@/store/useStore';
import { useColors } from '@/theme/useColors';

export default function Personas() {
  const c = useColors();
  const personas = useStore((s) => s.personas);
  const defaultId = useStore((s) => s.defaultPersonaId);
  const chats = useStore((s) => s.chats);
  const setDefault = useStore((s) => s.setDefaultPersona);

  return (
    <Screen>
      <StackHeader title="Personas" right={<IconButton name="add" label="New persona" onPress={() => router.push('/personas/new')} />} />
      <Scroll>
        <Txt secondary style={{ marginHorizontal: 4 }}>
          A persona is who you play. Characters see its name and bio. Your default is used for new chats; switch any time from Story info.
        </Txt>
        {personas.map((p) => {
          const on = p.id === defaultId;
          const used = chats.filter((ch) => ch.personaId === p.id).length;
          return (
            <View key={p.id} style={{ backgroundColor: c.surface, borderRadius: 28, padding: 16, gap: 10, borderWidth: 2, borderColor: on ? c.link : 'transparent' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Avatar image={p.image} name={p.name} size={48} />
                <View style={{ flex: 1 }}>
                  <Txt variant="bodyLg">{p.name}</Txt>
                  <Txt variant="caption" secondary>
                    {p.pronouns} · used in {used} {used === 1 ? 'chat' : 'chats'}
                  </Txt>
                </View>
                <IconButton name="create-outline" label={`Edit ${p.name}`} bg={c.fill} size={40} onPress={() => router.push(`/personas/${p.id}`)} />
              </View>
              {p.bio ? <Txt variant="label">{p.bio}</Txt> : null}
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                onPress={() => setDefault(p.id)}
                style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, height: 36, paddingLeft: 8, paddingRight: 14, borderRadius: 18, backgroundColor: on ? c.soft : c.fill }}>
                <Radio checked={on} />
                <Txt variant="caption" color={on ? c.softInk : c.ink}>
                  {on ? 'Default persona' : 'Make default'}
                </Txt>
              </Pressable>
            </View>
          );
        })}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/personas/new')}
          style={{ height: 56, borderRadius: 28, borderWidth: 1, borderStyle: 'dashed', borderColor: c.muted, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon name="add" size={18} />
          <Txt>Create a persona</Txt>
        </Pressable>
        <Button label="Done" kind="soft" onPress={() => router.back()} />
      </Scroll>
    </Screen>
  );
}
