import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { PaginationBar, PAGINATION_BAR_HEIGHT } from '@/components/PaginationBar';
import { championshipRoutes } from '@/constants/championshipRoutes';
import { theme } from '@/constants/theme';
import { AuthHeader, HomeIndicator, PencilScreen, useAuth } from '@/features/auth';
import {
  fetchMyProfileChampionshipsPage,
  formatMyChampionshipSubtitle,
  type MyChampionshipItem,
  type MyChampionshipsScope,
} from '@/features/championships';
import { ApiError } from '@/lib/api/graphql';

const PAGE_SIZE = 10;
const LIST_TOP = 188;
const CREATE_HEIGHT = 88;
const CONTENT_BOTTOM = 780;

const TABS: { key: MyChampionshipsScope; label: string }[] = [
  { key: 'ALL', label: 'Todos' },
  { key: 'PARTICIPATING', label: 'Participando' },
  { key: 'CREATED', label: 'Criados' },
];

export default function MyChampionshipsScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const [scope, setScope] = useState<MyChampionshipsScope>('ALL');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<MyChampionshipItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createTop = CONTENT_BOTTOM - CREATE_HEIGHT;
  const paginationTop = createTop - 12 - PAGINATION_BAR_HEIGHT;
  const listHeight = Math.max(120, paginationTop - LIST_TOP - 12);

  useEffect(() => {
    setPage(1);
  }, [scope]);

  const loadChampionships = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchMyProfileChampionshipsPage(token, {
        scope,
        page,
        pageSize: PAGE_SIZE,
      });
      setItems(data.items);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar seus campeonatos.',
      );
      setItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, scope, token]);

  useEffect(() => {
    void loadChampionships();
  }, [loadChampionships]);

  return (
    <PencilScreen canvasHeight={844}>
      <AuthHeader title="Meus Campeonatos" onBack={() => router.back()} />
      <Text style={styles.subtitle}>
        Campeonatos em que você participa ou criou.
      </Text>

      <View style={styles.tabsRow}>
        {TABS.map((tab) => {
          const active = tab.key === scope;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="button"
              onPress={() => setScope(tab.key)}
              style={[styles.tab, active && styles.tabActive]}
            >
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.listRegion, { top: LIST_TOP, height: listHeight }]}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : null}

        {!loading && error ? <Text style={styles.error}>{error}</Text> : null}

        {!loading && !error && items.length === 0 ? (
          <Text style={styles.empty}>
            Nenhum campeonato encontrado nesse filtro.
          </Text>
        ) : null}

        {!loading && !error && items.length > 0 ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator
            nestedScrollEnabled
          >
            {items.map((item) => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                onPress={() =>
                  router.push(championshipRoutes.detail(item.id) as never)
                }
                style={({ pressed }) => [
                  styles.champRow,
                  pressed && styles.rowPressed,
                ]}
              >
                <View style={styles.champIcon}>
                  <Ionicons
                    name="trophy-outline"
                    size={20}
                    color={theme.colors.primary}
                  />
                </View>
                <View style={styles.champText}>
                  <Text style={styles.champName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.champMeta} numberOfLines={1}>
                    {formatMyChampionshipSubtitle(item)}
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
          onPress={() => router.push(championshipRoutes.create as never)}
          style={({ pressed }) => [
            styles.createCard,
            { top: createTop },
            pressed && styles.rowPressed,
          ]}
        >
          <View style={styles.createIcon}>
            <Ionicons name="add" size={22} color={theme.colors.black} />
          </View>
          <View style={styles.champText}>
            <Text style={styles.champName}>Criar novo campeonato</Text>
            <Text style={styles.champMeta}>
              Qualquer usuário pode organizar um campeonato no MatchUp.
            </Text>
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
  tabsRow: {
    position: 'absolute',
    left: 20,
    top: 128,
    width: 350,
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tabLabel: {
    color: '#A6A5B0',
    fontSize: 13,
    fontWeight: theme.fontWeights.bold,
  },
  tabLabelActive: {
    color: theme.colors.black,
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
  champRow: {
    height: 80,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 12,
  },
  createCard: {
    position: 'absolute',
    left: 20,
    width: 350,
    minHeight: CREATE_HEIGHT,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  rowPressed: {
    opacity: 0.88,
    borderColor: theme.colors.borderStrong,
  },
  champIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#12131A',
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  createIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  champText: {
    flex: 1,
    gap: 4,
  },
  champName: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: theme.fontWeights.bold,
  },
  champMeta: {
    color: '#A6A5B0',
    fontSize: 12,
    fontWeight: '500',
  },
  paginationWrap: {
    position: 'absolute',
    left: 20,
    width: 350,
  },
});
