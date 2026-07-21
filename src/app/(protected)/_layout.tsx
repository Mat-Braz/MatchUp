import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { authRoutes } from '@/constants/authRoutes';
import { theme } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import {
  NotificationBadgeProvider,
  usePushNotifications,
} from '@/features/notifications';

function ProtectedShell() {
  usePushNotifications();

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: theme.colors.background },
        headerShown: false,
      }}
    />
  );
}

export default function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href={authRoutes.login} />;
  }

  return (
    <NotificationBadgeProvider>
      <ProtectedShell />
    </NotificationBadgeProvider>
  );
}
