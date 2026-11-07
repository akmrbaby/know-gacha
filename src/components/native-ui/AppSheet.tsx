import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomSheet, RNHostView } from '@expo/ui';
import { spacing, useThemeColors } from '../../theme';
import { NativeIconAction } from './NativeIconAction';
import { NativeText } from './NativeText';
import { AppIcon } from './AppIcon';

export function AppSheet({ title, closeLabel, onClose, children, testID, isPresented = true }: {
  title: string; closeLabel: string; onClose: () => void; children: ReactNode; testID: string; isPresented?: boolean;
}) {
  const colors = useThemeColors();
  // SDK 58 BottomSheet creates its own native Host on iOS/Android.
  return <BottomSheet isPresented={isPresented} onDismiss={onClose} snapPoints={['half', 'full']} containerColor={colors.surface} contentPadding={0} testID={testID}>
    <RNHostView>
      <View style={[styles.fill, { backgroundColor: colors.surface }]}>
        <View style={[styles.header, { borderBottomColor: colors.separator }]}>
          <NativeText variant="title" accessibilityRole="header" style={styles.title}>{title}</NativeText>
          <NativeIconAction label={closeLabel} onPress={onClose}><AppIcon name="close" /></NativeIconAction>
        </View>
        {children}
      </View>
    </RNHostView>
  </BottomSheet>;
}
const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  title: { flex: 1, paddingVertical: spacing.sm },
});
