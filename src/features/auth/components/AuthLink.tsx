import { Pressable, StyleSheet, Text } from 'react-native';
import { useRouter, type Href } from 'expo-router';

import { theme } from '@/constants/theme';

type AuthLinkProps = {
  href: Href;
  label: string;
  align?: 'left' | 'center' | 'right';
  strong?: boolean;
};

export function AuthLink({ href, label, align = 'center', strong = false }: AuthLinkProps) {
  const router = useRouter();

  return (
    <Pressable accessibilityRole="link" onPress={() => router.push(href)} style={[styles.root, styles[align]]}>
      <Text style={[styles.label, strong && styles.strong]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 28,
    justifyContent: 'center',
  },
  left: {
    alignItems: 'flex-start',
  },
  center: {
    alignItems: 'center',
  },
  right: {
    alignItems: 'flex-end',
  },
  label: {
    color: theme.colors.primarySoft,
    fontSize: 13,
    fontWeight: '500',
  },
  strong: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: theme.fontWeights.extraBold,
  },
});
