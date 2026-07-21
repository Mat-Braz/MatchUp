import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import Constants from 'expo-constants';

import { useAuth } from '@/features/auth';
import { registerPushToken } from '@/features/notifications/api/notifications';

function canUseNativePush(): boolean {
  if (Platform.OS === 'web') {
    return false;
  }

  // Expo Go does not ship ExpoPushTokenManager for this SDK setup.
  if (Constants.appOwnership === 'expo') {
    return false;
  }

  return true;
}

async function resolveExpoPushToken(): Promise<string | null> {
  if (!canUseNativePush()) {
    return null;
  }

  try {
    const Notifications = await import('expo-notifications');

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    const current = await Notifications.getPermissionsAsync();
    let status = current.status;

    if (status !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }

    if (status !== 'granted') {
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'MatchUp',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#B8FF3C',
      });
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const pushToken = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    return pushToken.data;
  } catch {
    return null;
  }
}

export function usePushNotifications() {
  const { token, isAuthenticated } = useAuth();
  const registeredRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token || !canUseNativePush()) {
      registeredRef.current = null;
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const expoPushToken = await resolveExpoPushToken();
        if (!expoPushToken || cancelled) {
          return;
        }
        if (registeredRef.current === expoPushToken) {
          return;
        }

        await registerPushToken(token, expoPushToken);
        registeredRef.current = expoPushToken;
      } catch {
        // Push registration is best-effort.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, token]);
}
