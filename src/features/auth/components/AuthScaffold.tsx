import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { Screen } from '@/components/ui';
import { theme } from '@/constants/theme';

type AuthScaffoldProps = PropsWithChildren<{
  eyebrow?: string;
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}>;

export function AuthScaffold({ children, eyebrow, title, subtitle, footer, contentStyle }: AuthScaffoldProps) {
  return (
    <Screen contentStyle={[styles.screen, contentStyle]} scroll={false}>
      <View style={styles.header}>
        <BrandLogo />
        <View style={styles.titleStack}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      <View style={styles.body}>{children}</View>

      <View style={styles.footer}>{footer}</View>
      <View style={styles.homeIndicator} />
    </Screen>
  );
}

export function BrandLogo() {
  return (
    <View style={styles.logoRow}>
      <View style={styles.logoMark}>
        <Text style={styles.logoLetter}>M</Text>
        <View style={styles.logoDot} />
      </View>
      <Text style={styles.logoWord}>atchUp</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 17,
    paddingTop: 64,
  },
  header: {
    gap: 42,
  },
  titleStack: {
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
    fontSize: 38,
    fontWeight: theme.fontWeights.extraBold,
    lineHeight: 42,
  },
  subtitle: {
    color: '#A6A5B0',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  body: {
    gap: 14,
  },
  footer: {
    minHeight: 24,
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoMark: {
    width: 88,
    height: 76,
    justifyContent: 'center',
  },
  logoLetter: {
    color: theme.colors.primary,
    fontSize: 64,
    fontWeight: theme.fontWeights.black,
    fontStyle: 'italic',
    lineHeight: 70,
  },
  logoDot: {
    position: 'absolute',
    right: 8,
    bottom: 7,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.primary,
  },
  logoWord: {
    marginLeft: -5,
    color: theme.colors.text,
    fontSize: 38,
    fontWeight: theme.fontWeights.extraBold,
    fontStyle: 'italic',
  },
  homeIndicator: {
    alignSelf: 'center',
    width: 130,
    height: 5,
    borderRadius: theme.radius.pill,
    backgroundColor: '#2A2A2A',
  },
});
