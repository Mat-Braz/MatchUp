import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useFocusEffect } from 'expo-router';

import { ProtectedCanvas, ScreenTitle } from '@/components/layout/PencilProtected';
import { theme } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import {
  clearMyNotifications,
  fetchMyNotifications,
  formatNotificationTime,
  inviteStatusLabel,
  markAllAlertsRead,
  markNotificationRead,
  respondToInvite,
  useNotificationBadge,
  type MyNotificationItem,
  type NotificationCategory,
} from '@/features/notifications';
import { ApiError } from '@/lib/api/graphql';

type TabKey = 'ALERTS' | 'INVITES';

export default function NotificationsScreen() {
  const { token } = useAuth();
  const { refresh: refreshBadge } = useNotificationBadge();
  const [tab, setTab] = useState<TabKey>('ALERTS');
  const [items, setItems] = useState<MyNotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<number | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [clearing, setClearing] = useState(false);

  const category: NotificationCategory =
    tab === 'INVITES' ? 'INVITES' : 'ALERTS';

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchMyNotifications(token, category));
      await refreshBadge();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar as notificações.',
      );
    } finally {
      setLoading(false);
    }
  }, [category, refreshBadge, token]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const unreadAlerts = useMemo(
    () => items.filter((item) => !item.isInvite && item.isUnread).length,
    [items],
  );

  const clearableCount = useMemo(() => {
    if (tab === 'ALERTS') {
      return items.length;
    }
    return items.filter((item) => item.status !== 'PENDENTE').length;
  }, [items, tab]);

  const listTop = 168;
  const canvasHeight = Math.max(844, listTop + items.length * 118 + 160);

  async function handleRespond(item: MyNotificationItem, accept: boolean) {
    if (!token || actingId) {
      return;
    }
    setActingId(item.id);
    setError(null);
    try {
      await respondToInvite(token, item.id, accept);
      await load();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível responder ao convite.',
      );
    } finally {
      setActingId(null);
    }
  }

  async function handleOpenAlert(item: MyNotificationItem) {
    if (!token || item.isInvite || !item.isUnread) {
      return;
    }
    try {
      await markNotificationRead(token, item.id);
      setItems((current) =>
        current.map((row) =>
          row.id === item.id
            ? { ...row, isUnread: false, status: 'LIDO', readAt: new Date().toISOString() }
            : row,
        ),
      );
      await refreshBadge();
    } catch {
      // silent — list still usable
    }
  }

  async function handleMarkAll() {
    if (!token || markingAll || tab !== 'ALERTS') {
      return;
    }
    setMarkingAll(true);
    try {
      await markAllAlertsRead(token);
      await load();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível marcar as notificações.',
      );
    } finally {
      setMarkingAll(false);
    }
  }

  function handleClearPress() {
    if (!token || clearing || clearableCount === 0) {
      return;
    }

    const isAlerts = tab === 'ALERTS';
    Alert.alert(
      isAlerts ? 'Limpar avisos?' : 'Limpar convites?',
      isAlerts
        ? 'Todos os avisos serão removidos da caixa.'
        : 'Convites já respondidos serão removidos. Os pendentes continuam aqui.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: () => {
            void handleClear();
          },
        },
      ],
    );
  }

  async function handleClear() {
    if (!token || clearing) {
      return;
    }
    setClearing(true);
    setError(null);
    try {
      await clearMyNotifications(token, category);
      await load();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível limpar as notificações.',
      );
    } finally {
      setClearing(false);
    }
  }

  return (
    <ProtectedCanvas active="Notificações" scroll canvasHeight={canvasHeight}>
      <ScreenTitle>Notificações</ScreenTitle>

      <View style={styles.tabs}>
        <Pressable onPress={() => setTab('ALERTS')}>
          <Text style={tab === 'ALERTS' ? styles.tabActive : styles.tab}>
            Avisos
          </Text>
        </Pressable>
        <Pressable onPress={() => setTab('INVITES')}>
          <Text style={tab === 'INVITES' ? styles.tabActive : styles.tab}>
            Convites
          </Text>
        </Pressable>
        <View style={styles.actionsRow}>
          {tab === 'ALERTS' ? (
            <Pressable
              onPress={handleMarkAll}
              disabled={markingAll || unreadAlerts === 0}
              style={styles.headerActionBtn}
            >
              <Text
                style={[
                  styles.headerAction,
                  (markingAll || unreadAlerts === 0) && styles.headerActionDisabled,
                ]}
              >
                {markingAll ? '...' : 'Marcar todas'}
              </Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={handleClearPress}
            disabled={clearing || clearableCount === 0}
            style={styles.headerActionBtn}
          >
            <Text
              style={[
                styles.headerAction,
                (clearing || clearableCount === 0) && styles.headerActionDisabled,
              ]}
            >
              {clearing ? '...' : 'Limpar'}
            </Text>
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View style={[styles.center, { top: listTop }]}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : null}

      {!loading && error ? (
        <Text style={[styles.error, { top: listTop }]}>{error}</Text>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <View style={[styles.empty, { top: listTop }]}>
          <Text style={styles.emptyTitle}>
            {tab === 'INVITES' ? 'Sem convites' : 'Sem avisos'}
          </Text>
          <Text style={styles.emptyMessage}>
            {tab === 'INVITES'
              ? 'Convites de time e campeonato aparecem aqui para você aceitar ou recusar.'
              : 'Suspensões, resultados e outros avisos aparecem nesta aba.'}
          </Text>
        </View>
      ) : null}

      {!loading && !error ? (
        <View style={[styles.list, { top: listTop }]}>
          {items.map((item) => {
            const statusLabel = inviteStatusLabel(item.status);
            const pendingInvite =
              item.isInvite && item.status === 'PENDENTE';

            return (
              <Pressable
                key={item.id}
                onPress={() => {
                  if (!item.isInvite) {
                    void handleOpenAlert(item);
                  }
                }}
                style={[styles.card, item.isUnread && styles.cardUnread]}
              >
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.dot,
                      item.isUnread ? styles.dotUnread : styles.dotRead,
                    ]}
                  />
                  <View style={styles.copy}>
                    <Text style={styles.title} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.message} numberOfLines={3}>
                      {item.message}
                    </Text>
                    <Text style={styles.meta}>
                      {[
                        item.fromUserName,
                        item.teamName,
                        formatNotificationTime(item.createdAt),
                        statusLabel,
                      ]
                        .filter(Boolean)
                        .join(' • ')}
                    </Text>
                  </View>
                </View>

                {pendingInvite ? (
                  <View style={styles.actions}>
                    <Pressable
                      disabled={actingId === item.id}
                      onPress={() => void handleRespond(item, false)}
                      style={[styles.actionBtn, styles.rejectBtn]}
                    >
                      <Text style={styles.rejectText}>
                        {actingId === item.id ? '...' : 'Recusar'}
                      </Text>
                    </Pressable>
                    <Pressable
                      disabled={actingId === item.id}
                      onPress={() => void handleRespond(item, true)}
                      style={[styles.actionBtn, styles.acceptBtn]}
                    >
                      <Text style={styles.acceptText}>
                        {actingId === item.id ? '...' : 'Aceitar'}
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </ProtectedCanvas>
  );
}

const styles = StyleSheet.create({
  tabs: {
    position: 'absolute',
    left: 24,
    top: 117,
    width: 342,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 26,
  },
  tabActive: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: theme.fontWeights.extraBold,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary,
    paddingBottom: 9,
  },
  tab: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: theme.fontWeights.extraBold,
  },
  actionsRow: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerActionBtn: {
    paddingVertical: 2,
  },
  headerAction: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: theme.fontWeights.extraBold,
  },
  headerActionDisabled: {
    opacity: 0.4,
  },
  center: {
    position: 'absolute',
    left: 24,
    width: 342,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    position: 'absolute',
    left: 24,
    width: 342,
    color: theme.colors.dangerSoft,
    textAlign: 'center',
    fontWeight: theme.fontWeights.semibold,
  },
  empty: {
    position: 'absolute',
    left: 24,
    width: 342,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceCard,
    padding: 24,
    gap: 8,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: theme.fontWeights.extraBold,
    textAlign: 'center',
  },
  emptyMessage: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  list: {
    position: 'absolute',
    left: 24,
    width: 342,
    gap: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceCard,
    padding: 14,
    gap: 12,
  },
  cardUnread: {
    borderColor: theme.colors.borderStrong,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  dotUnread: {
    backgroundColor: theme.colors.primary,
  },
  dotRead: {
    backgroundColor: theme.colors.surfaceHigh,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: theme.fontWeights.bold,
  },
  message: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  meta: {
    color: theme.colors.textDim,
    fontSize: 11,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  actionBtn: {
    minWidth: 96,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  rejectBtn: {
    backgroundColor: theme.colors.surfaceHigh,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  acceptBtn: {
    backgroundColor: theme.colors.primary,
  },
  rejectText: {
    color: theme.colors.textMuted,
    fontWeight: theme.fontWeights.bold,
    fontSize: 13,
  },
  acceptText: {
    color: theme.colors.black,
    fontWeight: theme.fontWeights.bold,
    fontSize: 13,
  },
});
