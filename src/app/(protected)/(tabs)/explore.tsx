import { useCallback, useEffect, useMemo, useState } from 'react';
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

import {
  ChampionshipCard,
  Chips,
  ProtectedCanvas,
  ScreenTitle,
  SearchBox,
} from '@/components/layout/PencilProtected';
import { PaginationBar, PAGINATION_BAR_HEIGHT } from '@/components/PaginationBar';
import { championshipRoutes } from '@/constants/championshipRoutes';
import { theme } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import {
  championshipStatusLabel,
  championshipYear,
  ExploreFilterModal,
  fetchExplorePublicChampionships,
  formatChampionshipDates,
  teamsCountLabel,
  type Championship,
  type ChampionshipStatus,
  type ExploreAdvancedFilters,
} from '@/features/championships';
import { ApiError } from '@/lib/api/graphql';

const PAGE_SIZE = 20;
const REFRESH_MS = 60_000;
const TAB_ITEMS = ['Todos', 'Inscrições', 'Em andamento', 'Encerrados'] as const;
type ExploreTab = (typeof TAB_ITEMS)[number];

const TAB_STATUS: Record<ExploreTab, ChampionshipStatus | undefined> = {
  Todos: undefined,
  Inscrições: 'INSCRICOES_ABERTAS',
  'Em andamento': 'EM_ANDAMENTO',
  Encerrados: 'ENCERRADO',
};

const SEARCH_BOTTOM = 155;
const BADGE_HEIGHT = 18;
const CHIPS_TOP_BASE = 166;
const LIST_TOP_BASE = 240;
const CONTENT_BOTTOM = 710;

const EMPTY_FILTERS: ExploreAdvancedFilters = {
  city: '',
  uf: '',
  championshipType: null,
};

export default function ExploreScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState<ExploreTab>('Todos');
  const [advancedFilters, setAdvancedFilters] =
    useState<ExploreAdvancedFilters>(EMPTY_FILTERS);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Championship[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedTab, advancedFilters]);

  const hasActiveAdvancedFilters = useMemo(
    () =>
      advancedFilters.city.trim().length > 0 ||
      advancedFilters.uf.trim().length > 0 ||
      advancedFilters.championshipType != null,
    [advancedFilters],
  );

  const chipsTop = hasActiveAdvancedFilters
    ? SEARCH_BOTTOM + BADGE_HEIGHT + 10
    : CHIPS_TOP_BASE;
  const listTop = hasActiveAdvancedFilters
    ? LIST_TOP_BASE + BADGE_HEIGHT + 10
    : LIST_TOP_BASE;

  const paginationTop = CONTENT_BOTTOM - PAGINATION_BAR_HEIGHT;
  const listHeight = Math.max(120, paginationTop - listTop - 12);

  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!token) {
        setLoading(false);
        return;
      }

      if (!opts?.silent) {
        setLoading(true);
      }
      setError(null);

      try {
        const result = await fetchExplorePublicChampionships(token, {
          name: debouncedSearch || undefined,
          city: advancedFilters.city.trim() || undefined,
          uf: advancedFilters.uf.trim() || undefined,
          championshipType: advancedFilters.championshipType ?? undefined,
          status: TAB_STATUS[selectedTab],
          page,
          pageSize: PAGE_SIZE,
        });
        setItems(result.items);
        setTotalPages(result.totalPages);
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : 'Não foi possível carregar os campeonatos.',
        );
        setItems([]);
        setTotalPages(1);
      } finally {
        if (!opts?.silent) {
          setLoading(false);
        }
      }
    },
    [advancedFilters, debouncedSearch, page, selectedTab, token],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      void load({ silent: true });
    }, REFRESH_MS);
    return () => clearInterval(intervalId);
  }, [load]);

  function handleTabSelect(index: number) {
    setSelectedTab(TAB_ITEMS[index]);
  }

  return (
    <ProtectedCanvas active="Explorar">
      <ScreenTitle>Explorar</ScreenTitle>

      <SearchBox
        placeholder="Buscar campeonatos..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        showFilter
        onFilterPress={() => setFilterModalVisible(true)}
      />

      {hasActiveAdvancedFilters ? (
        <View style={[styles.filtersActiveBadge, { top: SEARCH_BOTTOM + 4 }]}>
          <Ionicons name="funnel" size={12} color={theme.colors.primary} />
          <Text style={styles.filtersActiveText}>Filtros ativos</Text>
        </View>
      ) : null}

      <Chips
        items={[...TAB_ITEMS]}
        top={chipsTop}
        selectedIndex={TAB_ITEMS.indexOf(selectedTab)}
        onSelect={handleTabSelect}
      />

      <View style={[styles.listRegion, { top: listTop, height: listHeight }]}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : null}

        {!loading && error ? <Text style={styles.error}>{error}</Text> : null}

        {!loading && !error && items.length === 0 ? (
          <View style={styles.emptyInline}>
            <Text style={styles.emptyInlineTitle}>Nenhum campeonato encontrado</Text>
            <Text style={styles.emptyInlineMessage}>
              Tente outra busca ou ajuste os filtros.
            </Text>
          </View>
        ) : null}

        {!loading && !error && items.length > 0 ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator
            nestedScrollEnabled
          >
            {items.map((championship) => (
              <ChampionshipCard
                key={championship.id}
                title={championship.name}
                status={championshipStatusLabel(championship.status)}
                year={championshipYear(championship.startsAt, championship.endsAt)}
                dates={formatChampionshipDates(
                  championship.startsAt,
                  championship.endsAt,
                )}
                teams={teamsCountLabel(championship.teamsCount)}
                actionLabel="Ver detalhes"
                onPress={() =>
                  router.push(championshipRoutes.detail(championship.id) as never)
                }
              />
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

      <ExploreFilterModal
        visible={filterModalVisible}
        initialFilters={advancedFilters}
        onClose={() => setFilterModalVisible(false)}
        onApply={setAdvancedFilters}
      />
    </ProtectedCanvas>
  );
}

const styles = StyleSheet.create({
  filtersActiveBadge: {
    position: 'absolute',
    left: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 2,
  },
  filtersActiveText: {
    color: theme.colors.primarySoft,
    fontSize: 11,
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
  emptyInline: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  emptyInlineTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: theme.fontWeights.extraBold,
    textAlign: 'center',
  },
  emptyInlineMessage: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: theme.fontWeights.semibold,
    lineHeight: 20,
    textAlign: 'center',
  },
  paginationWrap: {
    position: 'absolute',
    left: 24,
    width: 342,
  },
});
