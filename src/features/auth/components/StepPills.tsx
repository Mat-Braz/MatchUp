import { StyleSheet, View } from 'react-native';

import { theme } from '@/constants/theme';

type StepPillsProps = {
  current: number;
  total: number;
};

export function StepPills({ current, total }: StepPillsProps) {
  return (
    <View style={styles.root}>
      {Array.from({ length: total }).map((_, index) => (
        <View key={index} style={[styles.pill, index <= current && styles.active]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  pill: {
    flex: 1,
    height: 4,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceHigh,
  },
  active: {
    backgroundColor: theme.colors.primary,
  },
});
