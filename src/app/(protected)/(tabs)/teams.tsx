import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';

import {
  ProtectedCanvas,
  ScreenTitle,
} from '@/components/layout/PencilProtected';
import { teamRoutes } from '@/constants/teamRoutes';
import { theme } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import {
  fetchMyTeams,
  formatTeamSubtitle,
  type MyTeamItem,
} from '@/features/teams';
import { ApiError } from '@/lib/api/graphql';

const EMPTY_BLOCK = 200;

export default function TeamsTabScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [teams, setTeams] = useState<MyTeamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setTeams(await fetchMyTeams(token));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Não foi possível carregar os times.',
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const listTop = 130;
  const canvasHeight = Math.max(
    844,
    listTop + (teams.length === 0 ? EMPTY_BLOCK : 0) + teams.length * 100 + 120 + 140,
  );

  return (
    <ProtectedCanvas active="Times" scroll canvasHeight={canvasHeight}>
      <ScreenTitle>Times</ScreenTitle>
      <Text style={styles.subtitle}>Crie, convide e monte sua escalação</Text>

      {loading ? (
        <View style={[styles.center, { top: listTop }]}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : null}

      {!loading && error ? (
        <Text style={[styles.error, { top: listTop }]}>{error}</Text>
      ) : null}

      {!loading && !error ? (
        <View style={[styles.list, { top: listTop }]}>
          {teams.length === 0 ? (
            <View style={styles.emptyBlock}>
              <Text style={styles.emptyTitle}>Nenhum time ainda</Text>
              <Text style={styles.emptyMessage}>
                Crie seu primeiro time e convide jogadores.
              </Text>
            </View>
          ) : null}

          {teams.map((team) => (
            <Pressable
              key={team.id}
              onPress={() => router.push(teamRoutes.edit(team.teamId) as never)}
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.88 }]}
            >
              <View style={styles.shield}>
                {team.shieldUrl ? (
                  <Image source={{ uri: team.shieldUrl }} style={styles.shieldImg} />
                ) : (
                  <Ionicons name="shield" size={24} color={theme.colors.primary} />
                )}
              </View>
              <View style={styles.copy}>
                <Text style={styles.name} numberOfLines={1}>
                  {team.teamName}
                </Text>
                <Text style={styles.meta} numberOfLines={1}>
                  {formatTeamSubtitle(team)}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={theme.colors.primarySoft}
              />
            </Pressable>
          ))}

          <Pressable
            onPress={() => router.push(teamRoutes.form as never)}
            style={({ pressed }) => [
              styles.createCard,
              pressed && { opacity: 0.88 },
            ]}
          >
            <View style={styles.createIcon}>
              <Ionicons name="add" size={22} color={theme.colors.black} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.name}>Criar time</Text>
              <Text style={styles.meta}>Nome, convites e formação</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.colors.primarySoft}
            />
          </Pressable>
        </View>
      ) : null}
    </ProtectedCanvas>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    position: 'absolute',
    left: 24,
    top: 100,
    width: 342,
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: theme.fontWeights.semibold,
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
  },
  list: {
    position: 'absolute',
    left: 24,
    width: 342,
    gap: 12,
  },
  emptyBlock: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceCard,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
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
    fontWeight: theme.fontWeights.semibold,
    lineHeight: 20,
    textAlign: 'center',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceCard,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 80,
  },
  createCard: {
    height: 88,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surfaceCard,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 12,
  },
  shield: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#12131A',
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    overflow: 'hidden',
  },
  shieldImg: {
    width: 48,
    height: 48,
  },
  createIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: theme.fontWeights.bold,
  },
  meta: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
});
