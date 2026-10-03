import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  useFonts,
} from '@expo-google-fonts/hanken-grotesk';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useSyncExternalStore } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useStore } from '@/store/useStore';
import { useColors } from '@/theme/useColors';

SplashScreen.preventAutoHideAsync().catch(() => {});

function useHydrated() {
  return useSyncExternalStore(
    (onChange) => useStore.persist.onFinishHydration(onChange),
    () => useStore.persist.hasHydrated(),
    () => false,
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ HankenGrotesk_400Regular, HankenGrotesk_500Medium, HankenGrotesk_600SemiBold });
  const hydrated = useHydrated();
  const c = useColors();
  const ready = (fontsLoaded || !!fontError) && hydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  const base = c.statusBar === 'light' ? DarkTheme : DefaultTheme;
  return (
    <SafeAreaProvider>
      <ThemeProvider value={{ ...base, colors: { ...base.colors, background: c.bg, card: c.surface, text: c.ink, border: c.line, primary: c.link } }}>
        <StatusBar style={c.statusBar} />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
