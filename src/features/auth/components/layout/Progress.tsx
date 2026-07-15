import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

export function Progress({ current }: { current: 1 | 2 | 3 }) {
  return (
    <View style={styles.progress}>
      {[1, 2, 3].map((step) => (
        <View key={step} style={[styles.progressPill, step <= current && styles.progressPillActive]} />
      ))}
      <Text style={styles.progressLabel}>{current}/3</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  progress: {
    position: 'absolute',
    left: 24,
    top: 162,
    width: 342,
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressPill: {
    flex: 1,
    height: 5,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.border,
  },
  progressPillActive: {
    backgroundColor: theme.colors.primary,
  },
  progressLabel: {
    color: '#A6A5B0',
    fontSize: 12,
    fontWeight: theme.fontWeights.extraBold,
  },
});
