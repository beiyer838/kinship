import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { CrisisLines } from '@/components/CrisisSheet';
import { ToggleRow } from '@/components/Form';
import { Icon } from '@/components/Icon';
import { Card, Row, Screen, Scroll, SectionTitle, StackHeader } from '@/components/Layout';
import { Sheet } from '@/components/Sheet';
import { Txt } from '@/components/Txt';
import { GENRES, ROLES } from '@/data/characters';
import { findCharacter, useStore } from '@/store/useStore';
import { palettes, type ThemeName } from '@/theme/tokens';
import { useColors } from '@/theme/useColors';

export default function Settings() {
  const c = useColors();
  const s = useStore();
  const persona = s.personas.find((p) => p.id === s.defaultPersonaId) ?? s.personas[0];
  const [sheet, setSheet] = useState<'interests' | 'blocked' | null>(null);

  return (
    <Screen>
      <StackHeader title="Settings" />
      <Scroll>
        <Card>
          <Pressable accessibilityRole="button" onPress={() => router.push(`/personas/${persona.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }}>
            <Avatar image={persona.image} name={persona.name} size={52} />
            <View style={{ flex: 1 }}>
              <Txt variant="bodyLg">{persona.name}</Txt>
              <Txt variant="caption" secondary>
                Default persona · edit
              </Txt>
            </View>
            <Icon name="chevron-forward" size={16} color={c.muted} />
          </Pressable>
        </Card>

        <Card style={{ paddingVertical: 16, gap: 12 }}>
          <Txt weight="medium" accessibilityRole="header">
            Appearance
          </Txt>
          <View accessibilityRole="radiogroup" accessibilityLabel="Theme" style={{ flexDirection: 'row', gap: 10 }}>
            {(Object.keys(palettes) as ThemeName[]).map((name) => {
              const p = palettes[name];
              const on = s.theme === name;
              return (
                <Pressable
                  key={name}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on }}
                  accessibilityLabel={`${name} theme`}
                  onPress={() => s.setTheme(name)}
                  style={{ flex: 1, alignItems: 'center', gap: 8, padding: 8, borderRadius: 24, borderWidth: 2, borderColor: on ? c.link : c.line }}>
                  <View style={{ width: '100%', height: 78, borderRadius: 18, padding: 8, gap: 5, backgroundColor: p.wall, borderWidth: 1, borderColor: c.line }}>
                    <View style={{ width: '60%', height: 12, borderRadius: 6, backgroundColor: p.bubbleIn }} />
                    <View style={{ alignSelf: 'flex-end', width: '55%', height: 12, borderRadius: 6, backgroundColor: p.bubbleOut }} />
                    <View style={{ marginTop: 'auto', height: 14, borderRadius: 7, backgroundColor: p.accent }} />
                  </View>
                  <Txt variant="label">{name}</Txt>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card>
          <Row first icon="people-outline" label="Personas" value={String(s.personas.length)} onPress={() => router.push('/personas')} />
          <Row icon="diamond-outline" label="Gems & plans" value={s.gems.toLocaleString()} onPress={() => router.push('/gems')} />
          <Row icon="heart-outline" label="Interests" value={String(s.interests.length)} onPress={() => setSheet('interests')} />
        </Card>

        <SectionTitle>Safety Center</SectionTitle>
        <Card>
          <ToggleRow label="Safety filter" hint="Hides 18+ characters and keeps replies suitable for everyone" value={s.safetyFilter} onChange={s.setSafetyFilter} />
          <Row icon="ban-outline" label="Blocked characters" value={String(s.blocked.length)} onPress={() => setSheet('blocked')} />
          <Row icon="flag-outline" label="Your reports" value={String(s.reports.length)} onPress={() => Alert.alert('Your reports', s.reports.length ? `You’ve sent ${s.reports.length}. Thank you.` : 'You haven’t reported anything.')} />
        </Card>
        <View style={{ backgroundColor: c.soft, borderRadius: 28, padding: 18, gap: 12 }}>
          <Txt weight="medium" color={c.softInk}>
            You’re not alone
          </Txt>
          <Txt variant="label" color={c.softInk}>
            If a chat suggests you might be at risk, Kinship shows these right away. Talk to a real person, any time.
          </Txt>
          <CrisisLines />
        </View>

        <Card>
          <Row first icon="document-text-outline" label="Community guidelines" onPress={() => Alert.alert('Community guidelines', 'Link your guidelines page here.')} />
          <Row icon="lock-closed-outline" label="Privacy Policy" onPress={() => Alert.alert('Privacy Policy', 'Link your privacy policy here.')} />
          <Row icon="reader-outline" label="Terms of Service" onPress={() => Alert.alert('Terms of Service', 'Link your terms here.')} />
        </Card>
        <Card>
          <Row
            first
            icon="trash-outline"
            label="Erase all data on this device"
            danger
            onPress={() =>
              Alert.alert('Erase everything?', 'Chats, characters, personas and gems on this device will be deleted.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Erase', style: 'destructive', onPress: () => { s.resetAll(); router.replace('/welcome'); } },
              ])
            }
          />
        </Card>
        <Txt variant="micro" secondary center>
          Kinship 1.0
        </Txt>
      </Scroll>

      <Sheet visible={sheet === 'interests'} onClose={() => setSheet(null)} title="Interests">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 4 }}>
          {[...GENRES, ...ROLES].map((g) => (
            <Chip
              key={g}
              label={g}
              role="checkbox"
              showCheck
              selected={s.interests.includes(g)}
              onPress={() => s.setInterests(s.interests.includes(g) ? s.interests.filter((x) => x !== g) : [...s.interests, g])}
            />
          ))}
        </View>
        <Button label="Done" style={{ marginTop: 16 }} onPress={() => setSheet(null)} />
      </Sheet>

      <Sheet visible={sheet === 'blocked'} onClose={() => setSheet(null)} title="Blocked">
        {s.blocked.length === 0 ? (
          <Txt secondary style={{ padding: 8 }}>
            No one is blocked.
          </Txt>
        ) : (
          s.blocked.map((id, i) => (
            <View key={id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 8, borderTopWidth: i ? 1 : 0, borderTopColor: c.line2 }}>
              <Txt style={{ flex: 1 }}>{findCharacter(id, s.customCharacters)?.name ?? id}</Txt>
              <Button label="Unblock" kind="soft" small onPress={() => s.unblock(id)} />
            </View>
          ))
        )}
      </Sheet>
    </Screen>
  );
}
