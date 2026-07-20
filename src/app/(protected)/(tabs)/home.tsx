import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';

import {
  ChampionshipCard,
  EmptyState,
  MatchUpLogoHeader,
  ProtectedCanvas,
  SectionLabel,
} from '@/components/layout/PencilProtected';
import { championshipRoutes } from '@/constants/championshipRoutes';
import { theme } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import {
  championshipStatusLabel,
  championshipYear,
  fetchMyChampionships,
  fetchRecommendedChampionships,
  formatChampionshipDates,
  teamsCountLabel,
  type Championship,
} from '@/features/championships';
import { fetchMyTokenBalance } from '@/features/tokens';
import { ApiError } from '@/lib/api/graphql';

const TOKENS_SECTION_TOP = 155;
const TOKENS_CARD_TOP = 190;
const TOKENS_CARD_HEIGHT = 72;
const RECOMMENDED_SECTION_TOP = TOKENS_CARD_TOP + TOKENS_CARD_HEIGHT + 28;
const RECOMMENDED_LIST_TOP = RECOMMENDED_SECTION_TOP + 35;
const CARD_HEIGHT = 150;
const CARD_GAP = 12;
const EMPTY_HEIGHT = 220;
const SECTION_GAP = 40;
const LIST_TO_SECTION = 35;

function blockHeight(count: number): number {
  if (count === 0) {
    return EMPTY_HEIGHT;
  }
  return count * CARD_HEIGHT + (count - 1) * CARD_GAP;
}

export default function HomeScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const [objects, setObjects] = useState({
    recommended: [] as Championship[],
    mine: [] as Championship[],
    tokenBalance: 0,
    error: null as string | null,
  });
  const [booleans, setBooleans] = useState({
    loading: true,
  });

  const { recommended, mine, tokenBalance, error } = objects;
  const { loading } = booleans;

  const loadHome = useCallback(async () => {
    if (!token) {
      setBooleans({ loading: false });
      return;
    }

    setBooleans({ loading: true });
    setObjects((current) => ({ ...current, error: null }));

    try {
      const [recommendedList, mineList, balance] = await Promise.all([
        fetchRecommendedChampionships(token),
        fetchMyChampionships(token),
        fetchMyTokenBalance(token),
      ]);

      setObjects({
        recommended: recommendedList,
        mine: mineList,
        tokenBalance: balance,
        error: null,
      });
    } catch (err) {
      setObjects((current) => ({
        ...current,
        error:
          err instanceof ApiError
            ? err.message
            : 'Não foi possível carregar os campeonatos.',
      }));
    } finally {
      setBooleans({ loading: false });
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      void loadHome();
    }, [loadHome]),
  );

  const mineSectionTop = useMemo(() => {
    return RECOMMENDED_LIST_TOP + blockHeight(recommended.length) + SECTION_GAP;
  }, [recommended.length]);

  const mineListTop = mineSectionTop + LIST_TO_SECTION;

  const canvasHeight = useMemo(() => {
    const contentBottom = mineListTop + blockHeight(mine.length) + 24;
    return Math.max(844, contentBottom + 110);
  }, [mine.length, mineListTop]);

  function handleCreatePress() {
    router.push(championshipRoutes.create as never);
  }

  function handleBuyTokensPress() {
    router.push(championshipRoutes.buyTokens as never);
  }

  return (
    <ProtectedCanvas active="Início" scroll canvasHeight={canvasHeight}>
      <MatchUpLogoHeader />

      <SectionLabel top={TOKENS_SECTION_TOP}>Tokens</SectionLabel>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Comprar tokens"
        onPress={handleBuyTokensPress}
        style={({ pressed }) => [
          styles.tokensCard,
          { top: TOKENS_CARD_TOP },
          pressed && styles.tokensCardPressed,
        ]}
      >
        <View style={styles.tokensIcon}>
          <Ionicons name="ticket-outline" size={22} color={theme.colors.black} />
        </View>
        <View style={styles.tokensText}>
          <Text style={styles.tokensTitle}>Comprar tokens</Text>
          <Text style={styles.tokensMeta}>
            Saldo: {tokenBalance} token{tokenBalance === 1 ? '' : 's'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.primarySoft} />
      </Pressable>

      <SectionLabel top={RECOMMENDED_SECTION_TOP}>Campeonatos Recomendados</SectionLabel>

      {loading ? (
        <View style={[styles.loadingBox, { top: RECOMMENDED_LIST_TOP }]}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : null}

      {!loading && error ? (
        <Text style={[styles.error, { top: RECOMMENDED_LIST_TOP }]}>{error}</Text>
      ) : null}

      {!loading && !error && recommended.length === 0 ? (
        <EmptyState
          top={RECOMMENDED_LIST_TOP}
          title="Nenhum campeonato ainda"
          message="Quando houver campeonatos disponíveis, eles aparecerão aqui."
        />
      ) : null}

      {!loading && !error
        ? recommended.map((championship, index) => (
            <ChampionshipCard
              key={`recommended-${championship.id}`}
              top={RECOMMENDED_LIST_TOP + index * (CARD_HEIGHT + CARD_GAP)}
              title={championship.name}
              status={championshipStatusLabel(championship.status)}
              year={championshipYear(championship.startsAt, championship.endsAt)}
              dates={formatChampionshipDates(championship.startsAt, championship.endsAt)}
              teams={teamsCountLabel(championship.teamsCount)}
              actionLabel={
                championship.isPublic ? 'Solicitar inscrição' : 'Ver detalhes'
              }
              onPress={() =>
                router.push(championshipRoutes.detail(championship.id) as never)
              }
            />
          ))
        : null}

      <SectionLabel top={mineSectionTop} action="+ Criar" onActionPress={handleCreatePress}>
        Meus Campeonatos
      </SectionLabel>

      {!loading && !error && mine.length === 0 ? (
        <EmptyState
          top={mineListTop}
          title="Você ainda não criou nada"
          message="Seus campeonatos criados ou participações ficarão nesta área."
        />
      ) : null}

      {!loading && !error
        ? mine.map((championship, index) => (
            <ChampionshipCard
              key={`mine-${championship.id}`}
              top={mineListTop + index * (CARD_HEIGHT + CARD_GAP)}
              title={championship.name}
              status={championshipStatusLabel(championship.status)}
              year={championshipYear(championship.startsAt, championship.endsAt)}
              dates={formatChampionshipDates(championship.startsAt, championship.endsAt)}
              teams={teamsCountLabel(championship.teamsCount)}
              actionLabel="Gerenciar"
              onPress={() =>
                router.push(championshipRoutes.detail(championship.id) as never)
              }
            />
          ))
        : null}
    </ProtectedCanvas>
  );
}

const styles = StyleSheet.create({
  tokensCard: {
    position: 'absolute',
    left: 24,
    width: 342,
    height: TOKENS_CARD_HEIGHT,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 12,
  },
  tokensCardPressed: {
    opacity: 0.88,
  },
  tokensIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  tokensText: {
    flex: 1,
    gap: 2,
  },
  tokensTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: theme.fontWeights.bold,
  },
  tokensMeta: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: theme.fontWeights.semibold,
  },
  loadingBox: {
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
    fontSize: 13,
    fontWeight: theme.fontWeights.semibold,
    textAlign: 'center',
  },
});
