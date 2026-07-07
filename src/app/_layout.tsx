import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { theme } from '@/constants/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: theme.colors.background },
          headerShown: false,
        }}
      />
    </>
  );
}
