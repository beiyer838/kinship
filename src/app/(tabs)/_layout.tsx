import { Redirect, Tabs } from 'expo-router';

import { TabBar } from '@/components/TabBar';
import { useStore } from '@/store/useStore';
import { useColors } from '@/theme/useColors';

export default function TabsLayout() {
  const onboarded = useStore((s) => s.onboarded);
  const c = useColors();
  if (!onboarded) return <Redirect href="/welcome" />;
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.bg } }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="chats" />
      <Tabs.Screen name="create" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
