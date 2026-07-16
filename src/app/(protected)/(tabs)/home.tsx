import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import {
  ChampionshipCard,
  EmptyState,
  MatchUpLogoHeader,
  ProtectedCanvas,
  SectionLabel,
} from '@/components/layout/PencilProtected';
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
import { ApiError } from '@/lib/api/graphql';

const RECOMMENDED_SECTION_TOP = 155;
const RECOMMENDED_LIST_TOP = 190;
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
  const { token } = useAuth();

  const [objects, setObjects] = useState({
    recommended: [] as Championship[],
    mine: [] as Championship[],
    error: null as string | null,
  });
  const [booleans, setBooleans] = useState({
    loading: true,
  });

  const { recommended, mine, error } = objects;
  const { loading } = booleans;

  useEffect(() => {
    if (!token) {
      setBooleans({ loading: false });
      return;
    }

    let cancelled = false;

    (async () => {
      setBooleans({ loading: true });
      setObjects((current) => ({ ...current, error: null }));

      try {
        const [recommendedList, mineList] = await Promise.all([
          fetchRecommendedChampionships(token),
          fetchMyChampionships(token),
        ]);

        if (!cancelled) {
          setObjects({
            recommended: recommendedList,
            mine: mineList,
            error: null,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setObjects((current) => ({
            ...current,
            error:
              err instanceof ApiError
                ? err.message
                : 'Não foi possível carregar os campeonatos.',
          }));
        }
      } finally {
        if (!cancelled) {
          setBooleans({ loading: false });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const mineSectionTop = useMemo(() => {
    return RECOMMENDED_LIST_TOP + blockHeight(recommended.length) + SECTION_GAP;
  }, [recommended.length]);

  const mineListTop = mineSectionTop + LIST_TO_SECTION;

  const canvasHeight = useMemo(() => {
    const contentBottom = mineListTop + blockHeight(mine.length) + 24;
    return Math.max(844, contentBottom + 110);
  }, [mine.length, mineListTop]);

  function handleCreatePress() {
    Alert.alert('Em breve', 'A criação de campeonatos estará disponível em breve.');
  }

  return (
    <ProtectedCanvas active="Início" scroll canvasHeight={canvasHeight}>
      <MatchUpLogoHeader />
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
              actionLabel="Solicitar inscrição"
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
            />
          ))
        : null}
    </ProtectedCanvas>
  );
}

const styles = StyleSheet.create({
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
