import { StyleSheet, Text } from 'react-native';

import { theme } from '@/constants/theme';

export function AuthTitle({
  title,
  subtitle,
  top = 65,
}: {
  title: string;
  subtitle: string;
  top?: number;
}) {
  return (
    <>
      <Text style={[styles.title, { top }]}>{title}</Text>
      <Text style={[styles.subtitle, { top: top + 52 }]}>{subtitle}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    position: 'absolute',
    left: 24,
    width: 342,
    color: theme.colors.text,
    fontSize: 38,
    fontWeight: theme.fontWeights.extraBold,
    lineHeight: 42,
  },
  subtitle: {
    position: 'absolute',
    left: 24,
    width: 342,
    color: '#A6A5B0',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
});
