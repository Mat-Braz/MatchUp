import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
};

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <View style={styles.root}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceLow,
    padding: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption,
    fontWeight: theme.fontWeights.black,
  },
  value: {
    color: theme.colors.text,
    fontSize: theme.typography.metric,
    fontWeight: theme.fontWeights.bold,
  },
  hint: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
    fontWeight: theme.fontWeights.bold,
  },
});
