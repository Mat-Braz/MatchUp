import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type HeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function Header({ eyebrow, title, description }: HeaderProps) {
  return (
    <View style={styles.root}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: theme.spacing.sm,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption,
    fontWeight: theme.fontWeights.black,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.heading,
    fontWeight: theme.fontWeights.black,
    lineHeight: 34,
  },
  description: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    fontWeight: theme.fontWeights.semibold,
    lineHeight: 20,
  },
});
