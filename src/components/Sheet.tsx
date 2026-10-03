import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/theme/useColors';

import { Txt } from './Txt';

export function Sheet({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable accessibilityLabel="Close" accessibilityRole="button" onPress={onClose} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: c.overlay }} />
        <View
          accessibilityViewIsModal
          style={{ backgroundColor: c.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingTop: 10, paddingHorizontal: 12, paddingBottom: insets.bottom + 16, maxHeight: '88%' }}>
          <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: c.line, alignSelf: 'center', marginBottom: 10 }} />
          {title ? (
            <Txt variant="heading" accessibilityRole="header" style={{ paddingHorizontal: 8, marginBottom: 8 }}>
              {title}
            </Txt>
          ) : null}
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
