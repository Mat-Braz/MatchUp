import { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type BadgeProps = PropsWithChildren<{
  label?: string;
}>;

export function Badge({ children, label }: BadgeProps) {
  return (
    <View style={styles.root}>
      {children ?? <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surfaceLow,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  label: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption,
    fontWeight: theme.fontWeights.black,
  },
});
