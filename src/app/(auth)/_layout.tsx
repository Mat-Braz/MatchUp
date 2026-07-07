import { Stack } from 'expo-router';

import { theme } from '@/constants/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: theme.colors.background },
        headerShown: false,
      }}
    />
  );
}
