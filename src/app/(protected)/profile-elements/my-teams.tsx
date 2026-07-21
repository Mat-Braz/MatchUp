import { useCallback, useEffect, useState } from 'react';
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
import { useRouter } from 'expo-router';

import { PaginationBar, PAGINATION_BAR_HEIGHT } from '@/components/PaginationBar';
import { theme } from '@/constants/theme';
import { AuthHeader, HomeIndicator, PencilScreen, useAuth } from '@/features/auth';
import {
  fetchMyTeamsPage,
  formatTeamSubtitle,
  type MyTeamItem,
} from '@/features/teams';
import { ApiError } from '@/lib/api/graphql';
import { teamRoutes } from '@/constants/teamRoutes';

const PAGE_SIZE = 10;
const LIST_TOP = 132;
const CREATE_HEIGHT = 80;
const CONTENT_BOTTOM = 780;

export default function MyTeamsScreen() {
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

  const loadTeams = useCallback(async () => {
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
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar seus times.',
      );
      setTeams([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, token]);

  useEffect(() => {
    void loadTeams();
  }, [loadTeams]);

  return (
    <PencilScreen canvasHeight={844}>
      <AuthHeader title="Meus Times" onBack={() => router.back()} />
      <Text style={styles.subtitle}>
        Toque em um time para ver ou editar dados, convites e formação.
      </Text>

      <View style={[styles.listRegion, { top: LIST_TOP, height: listHeight }]}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : null}

        {!loading && error ? <Text style={styles.error}>{error}</Text> : null}

        {!loading && !error && teams.length === 0 ? (
          <Text style={styles.empty}>
            Você ainda não participa de nenhum time.
          </Text>
        ) : null}

        {!loading && !error && teams.length > 0 ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator
            nestedScrollEnabled
          >
            {teams.map((team) => (
              <Pressable
                key={team.id}
                accessibilityRole="button"
                onPress={() => router.push(teamRoutes.edit(team.teamId) as never)}
                style={({ pressed }) => [
                  styles.teamCard,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.teamIcon}>
                  {team.shieldUrl ? (
                    <Image
                      source={{ uri: team.shieldUrl }}
                      style={styles.shieldImg}
                    />
                  ) : (
                    <Ionicons
                      name="shield-outline"
                      size={22}
                      color={theme.colors.primary}
                    />
                  )}
                </View>
                <View style={styles.teamText}>
                  <Text style={styles.teamName} numberOfLines={1}>
                    {team.teamName}
                  </Text>
                  <Text style={styles.teamMeta} numberOfLines={1}>
                    {formatTeamSubtitle(team)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#80808A" />
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
          accessibilityRole="button"
          onPress={() => router.push(teamRoutes.form as never)}
          style={({ pressed }) => [
            styles.createCard,
            { top: createTop },
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.createIcon}>
            <Ionicons name="add" size={22} color={theme.colors.black} />
          </View>
          <View style={styles.teamText}>
            <Text style={styles.teamName}>Criar novo time</Text>
            <Text style={styles.teamMeta}>Mesma tela da aba Times</Text>
          </View>
        </Pressable>
      ) : null}

      <HomeIndicator top={820} />
    </PencilScreen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    position: 'absolute',
    left: 20,
    top: 84,
    width: 350,
    color: '#A6A5B0',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  listRegion: {
    position: 'absolute',
    left: 20,
    width: 350,
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 4,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: theme.colors.dangerSoft,
    fontSize: 13,
    fontWeight: theme.fontWeights.semibold,
    textAlign: 'center',
    marginTop: 24,
  },
  empty: {
    color: '#A6A5B0',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 24,
  },
  teamCard: {
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 80,
  },
  pressed: {
    opacity: 0.88,
    borderColor: theme.colors.borderStrong,
  },
  teamIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#12131A',
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    overflow: 'hidden',
  },
  shieldImg: {
    width: 44,
    height: 44,
  },
  teamText: {
    flex: 1,
    gap: 4,
  },
  teamName: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: theme.fontWeights.bold,
  },
  teamMeta: {
    color: '#A6A5B0',
    fontSize: 12,
    fontWeight: '500',
  },
  createCard: {
    position: 'absolute',
    left: 20,
    width: 350,
    height: CREATE_HEIGHT,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 12,
  },
  createIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  paginationWrap: {
    position: 'absolute',
    left: 20,
    width: 350,
  },
});
