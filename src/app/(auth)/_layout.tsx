import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { theme } from '@/constants/theme';
import { useAuth } from '@/features/auth';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(protected)" />;
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: theme.colors.background },
        headerShown: false,
      }}
    />
  );
}
