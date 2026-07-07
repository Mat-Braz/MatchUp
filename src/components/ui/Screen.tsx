import { PropsWithChildren } from 'react';
import { SafeAreaView, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { theme } from '@/constants/theme';

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}>;

export function Screen({ children, scroll = true, contentStyle }: ScreenProps) {
  if (!scroll) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={[styles.content, contentStyle]}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={[styles.content, contentStyle]}>{children}</ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.screen,
    gap: theme.spacing.lg,
  },
});
