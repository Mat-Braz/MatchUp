import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui';
import { theme } from '@/constants/theme';

type EmptyProtectedScreenProps = {
  eyebrow: string;
  title: string;
};

export function EmptyProtectedScreen({ eyebrow, title }: EmptyProtectedScreenProps) {
  return (
    <Screen contentStyle={styles.screen} scroll={false}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.emptyArea} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: 56,
  },
  header: {
    gap: theme.spacing.sm,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption,
    fontWeight: theme.fontWeights.black,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: theme.colors.text,
    fontSize: 34,
    fontWeight: theme.fontWeights.black,
    lineHeight: 39,
  },
  emptyArea: {
    flex: 1,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceLow,
  },
});
