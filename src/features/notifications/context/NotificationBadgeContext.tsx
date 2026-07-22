import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { AppState } from 'react-native';

import { useAuth } from '@/features/auth';
import { fetchUnreadNotificationCount } from '@/features/notifications/api/notifications';

type NotificationBadgeContextValue = {
  unreadCount: number;
  hasUnread: boolean;
  refresh: () => Promise<void>;
};

const NotificationBadgeContext = createContext<NotificationBadgeContextValue | null>(
  null,
);

const BADGE_POLL_MS = 30_000;

export function NotificationBadgeProvider({ children }: PropsWithChildren) {
  const { token } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!token) {
      setUnreadCount(0);
      return;
    }

    try {
      const count = await fetchUnreadNotificationCount(token);
      setUnreadCount(count);
    } catch {
      // Keep the last known count when the request fails silently.
    }
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const intervalId = setInterval(() => {
      void refresh();
    }, BADGE_POLL_MS);

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void refresh();
      }
    });

    return () => {
      clearInterval(intervalId);
      subscription.remove();
    };
  }, [refresh, token]);

  const value = useMemo(
    () => ({
      unreadCount,
      hasUnread: unreadCount > 0,
      refresh,
    }),
    [refresh, unreadCount],
  );

  return (
    <NotificationBadgeContext.Provider value={value}>
      {children}
    </NotificationBadgeContext.Provider>
  );
}

export function useNotificationBadge() {
  const context = useContext(NotificationBadgeContext);
  if (!context) {
    throw new Error('useNotificationBadge must be used within NotificationBadgeProvider');
  }
  return context;
}
