import { type ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { BottomSheet, Column, RNHostView, ScrollView as SheetScrollView } from '@expo/ui';
import { spacing, useThemeColors } from '../../theme';
import { NativeIconAction } from './NativeIconAction';
import { NativeText } from './NativeText';
import { AppIcon } from './AppIcon';

export function AppSheet({ title, closeLabel, onClose, children, testID, isPresented = true, contentKey }: {
  title: string; closeLabel: string; onClose: () => void; children: ReactNode; testID: string; isPresented?: boolean; contentKey?: string;
}) {
  const colors = useThemeColors();
  const header = <View style={[styles.header, { borderBottomColor: colors.separator }]}>
    <NativeText variant="title" accessibilityRole="header" style={styles.title}>{title}</NativeText>
    <NativeIconAction label={closeLabel} onPress={onClose}><AppIcon name="close" /></NativeIconAction>
  </View>;
  // SDK 58 BottomSheet creates its own native Host on iOS/Android.
  return <BottomSheet isPresented={isPresented} onDismiss={onClose} snapPoints={['half', 'full']} containerColor={colors.surface} contentPadding={0} testID={testID}>
    {Platform.OS === 'ios' ? <Column spacing={0}>
      <RNHostView matchContents={{ vertical: true }}>{header}</RNHostView>
      {/* Let SwiftUI own both the visible scroll height and the sheet gesture.
          The RN subtree reports its entire content height, rather than a viewport. */}
      <SheetScrollView key={contentKey} testID={`${testID}-scroll`}>
        <RNHostView matchContents={{ vertical: true }}>
          <View style={styles.content}>{children}</View>
        </RNHostView>
      </SheetScrollView>
    </Column> : <RNHostView>
      <View style={[styles.fill, { backgroundColor: colors.surface }]}>
        {header}
        <ScrollView key={contentKey} nestedScrollEnabled style={styles.fill} testID={`${testID}-scroll`}>
          {children}
        </ScrollView>
      </View>
    </RNHostView>}
  </BottomSheet>;
}
const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { alignSelf: 'stretch' },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  title: { flex: 1, paddingVertical: spacing.sm },
});
