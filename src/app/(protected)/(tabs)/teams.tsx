import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
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
import { PaginationBar, PAGINATION_BAR_HEIGHT } from '@/components/PaginationBar';
import { teamRoutes } from '@/constants/teamRoutes';
import { theme } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import {
  fetchMyTeamsPage,
  formatTeamSubtitle,
  type MyTeamItem,
} from '@/features/teams';
import { ApiError } from '@/lib/api/graphql';

const PAGE_SIZE = 10;
const LIST_TOP = 130;
const CREATE_HEIGHT = 88;
const CONTENT_BOTTOM = 710;

export default function TeamsTabScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [teams, setTeams] = useState<MyTeamItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createTop = CONTENT_BOTTOM - CREATE_HEIGHT;
  const paginationTop = createTop - 12 - PAGINATION_BAR_HEIGHT;
  const listHeight = Math.max(120, paginationTop - LIST_TOP - 12);

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchMyTeamsPage(token, { page, pageSize: PAGE_SIZE });
      setTeams(result.items);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Não foi possível carregar os times.',
      );
      setTeams([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, token]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <ProtectedCanvas active="Times">
      <ScreenTitle>Times</ScreenTitle>
      <Text style={styles.subtitle}>Crie, convide e monte sua escalação</Text>

      <View style={[styles.listRegion, { top: LIST_TOP, height: listHeight }]}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : null}

        {!loading && error ? <Text style={styles.error}>{error}</Text> : null}

        {!loading && !error ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator
            nestedScrollEnabled
          >
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
          </ScrollView>
        ) : null}
      </View>

      {!error ? (
        <View style={[styles.paginationWrap, { top: paginationTop }]}>
          <PaginationBar
            page={page}
            totalPages={totalPages}
            disabled={loading}
            onPrev={() => setPage((current) => Math.max(1, current - 1))}
            onNext={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
          />
        </View>
      ) : null}

      {!loading ? (
        <Pressable
          onPress={() => router.push(teamRoutes.form as never)}
          style={({ pressed }) => [
            styles.createCard,
            { top: createTop },
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
  listRegion: {
    position: 'absolute',
    left: 24,
    width: 342,
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 4,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: theme.colors.dangerSoft,
    textAlign: 'center',
    marginTop: 24,
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
    position: 'absolute',
    left: 24,
    width: 342,
    height: CREATE_HEIGHT,
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
  paginationWrap: {
    position: 'absolute',
    left: 24,
    width: 342,
  },
});
