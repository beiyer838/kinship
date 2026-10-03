import type { BottomTabBarProps } from 'expo-router/tabs';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStore } from '@/store/useStore';
import { useColors } from '@/theme/useColors';

import { tap } from './Button';
import { Icon, type IconName } from './Icon';
import { Txt } from './Txt';

const TABS: Record<string, { label: string; icon: IconName; active: IconName }> = {
  index: { label: 'Discover', icon: 'compass-outline', active: 'compass' },
  chats: { label: 'Chats', icon: 'chatbubble-outline', active: 'chatbubble' },
  create: { label: 'Create', icon: 'add-circle-outline', active: 'add-circle' },
  profile: { label: 'Profile', icon: 'person-outline', active: 'person' },
};

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const unread = useStore((s) => s.chats.reduce((n, ch) => n + (ch.unread ? 1 : 0), 0));
  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: c.surface,
        borderTopWidth: 1,
        borderTopColor: c.line,
        paddingTop: 8,
        paddingBottom: Math.max(insets.bottom, 10),
      }}>
      {state.routes.map((route, i) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const focused = state.index === i;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={route.name === 'chats' && unread ? `${tab.label}, ${unread} unread` : tab.label}
            onPress={() => {
              tap();
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            }}
            style={{ width: 80, alignItems: 'center', gap: 4 }}>
            <View style={{ width: 60, height: 32, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: focused ? c.soft : 'transparent' }}>
              <Icon name={focused ? tab.active : tab.icon} size={22} color={focused ? c.softInk : c.ink} />
              {route.name === 'chats' && unread ? (
                <View style={{ position: 'absolute', top: -2, right: 8, minWidth: 18, height: 18, paddingHorizontal: 5, borderRadius: 9, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' }}>
                  <Txt variant="micro" weight="semibold" color={c.onAccent} style={{ fontSize: 11, lineHeight: 14 }}>
                    {unread}
                  </Txt>
                </View>
              ) : null}
            </View>
            <Txt variant="micro" weight={focused ? 'semibold' : 'regular'} color={focused ? c.ink : c.ink2}>
              {tab.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}
