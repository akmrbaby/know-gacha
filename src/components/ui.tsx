import { type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export const colors = { paper: '#F6F2E9', ink: '#263E36', muted: '#626B61', accent: '#9B4B31', card: '#FFFCF5', line: '#DDD9CC' };
export function Page({ children }: {
    children: ReactNode;
}) {
    return <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}><ScrollView contentContainerStyle={styles.page}>{children}</ScrollView></SafeAreaView>;
}
export function Action({ title, onPress, disabled = false, secondary = false }: {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    secondary?: boolean;
}) {
    return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, secondary && styles.secondary, (pressed || disabled) && { opacity: 0.55 }]}><Text style={[styles.buttonText, secondary && { color: colors.ink }]}>{title}</Text></Pressable>;
}
export function Card({ children }: {
    children: ReactNode;
}) { return <View style={styles.card}>{children}</View>; }
export const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.paper },
    page: { padding: 24, gap: 24, width: '100%', maxWidth: 680, alignSelf: 'center', paddingBottom: 48 },
    eyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 2, color: colors.accent },
    title: { fontSize: 34, fontWeight: '700', color: colors.ink, lineHeight: 46 },
    heading: { fontSize: 21, fontWeight: '700', color: colors.ink, lineHeight: 32 },
    body: { fontSize: 17, lineHeight: 31, color: colors.ink },
    small: { fontSize: 13, lineHeight: 23, color: colors.muted },
    card: { backgroundColor: colors.card, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: colors.line, gap: 16 },
    button: { backgroundColor: colors.ink, paddingVertical: 17, paddingHorizontal: 18, minHeight: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.line },
    buttonText: { color: colors.card, fontSize: 16, fontWeight: '600', lineHeight: 25, textAlign: 'center' },
});
