import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { theme } from '@/constants/theme';
import { protectedProfileRoutes } from '@/constants/protectedProfileRoutes';
import { AuthHeader, HomeIndicator, PencilScreen, useAuth } from '@/features/auth';
import {
  fetchMyPlayerStats,
  formatChampionshipMeta,
  type PlayerStats,
} from '@/features/statistics';
import { ApiError } from '@/lib/api/graphql';

const EMPTY_STATS: PlayerStats = {
  games: 0,
  wins: 0,
  goals: 0,
  assists: 0,
  cards: 0,
  recentChampionships: [],
};

export default function StatisticsScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const [stats, setStats] = useState<PlayerStats>(EMPTY_STATS);
  const [booleans, setBooleans] = useState({
    loading: true,
  });
  const [error, setError] = useState<string | null>(null);

  const { loading } = booleans;

  const loadStats = useCallback(async () => {
    if (!token) {
      setBooleans({ loading: false });
      return;
    }

    setBooleans({ loading: true });
    setError(null);

    try {
      const data = await fetchMyPlayerStats(token);
      setStats(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar suas estatísticas.',
      );
    } finally {
      setBooleans({ loading: false });
    }
  }, [token]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  return (
    <PencilScreen scroll canvasHeight={900}>
      <AuthHeader title="Estatísticas" onBack={() => router.back()} />
      <Text style={styles.subtitle}>
        Acompanhe seu desempenho em campeonatos e partidas.
      </Text>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : null}

      {!loading && error ? <Text style={styles.error}>{error}</Text> : null}

      {!loading && !error ? (
        <>
          <View style={[styles.statCard, styles.gamesCard]}>
            <Text style={styles.statValue}>{stats.games}</Text>
            <Text style={styles.statLabel}>Jogos</Text>
          </View>
          <View style={[styles.statCard, styles.winsCard]}>
            <Text style={styles.statValue}>{stats.wins}</Text>
            <Text style={styles.statLabel}>Vitórias</Text>
          </View>

          <View style={[styles.statCard, styles.goalsCard]}>
            <Text style={styles.statValueSmall}>{stats.goals}</Text>
            <Text style={styles.statLabel}>Gols</Text>
          </View>
          <View style={[styles.statCard, styles.assistsCard]}>
            <Text style={styles.statValueSmall}>{stats.assists}</Text>
            <Text style={styles.statLabel}>Assist.</Text>
          </View>
          <View style={[styles.statCard, styles.cardsCard]}>
            <Text style={styles.statValueSmall}>{stats.cards}</Text>
            <Text style={styles.statLabel}>Cartões</Text>
          </View>

          <Text style={styles.sectionTitle}>Últimos campeonatos</Text>

          {stats.recentChampionships.length === 0 ? (
            <Text style={styles.emptyChampionships}>
              Você ainda não possui eventos registrados em campeonatos.
            </Text>
          ) : (
            stats.recentChampionships.map((item, index) => (
              <View
                key={item.id}
                style={[styles.champRow, { top: 430 + index * 88 }]}
              >
                <View style={styles.champIcon}>
                  <Ionicons name="trophy-outline" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.champText}>
                  <Text style={styles.champName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.champMeta} numberOfLines={1}>
                    {formatChampionshipMeta(item)}
                  </Text>
                </View>
              </View>
            ))
          )}

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(protectedProfileRoutes.myChampionships)}
            style={styles.seeAllButton}
          >
            <Text style={styles.seeAllText}>Ver todos os meus campeonatos</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
          </Pressable>
        </>
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
  loadingBox: {
    position: 'absolute',
    left: 20,
    top: 220,
    width: 350,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    position: 'absolute',
    left: 20,
    top: 180,
    width: 350,
    color: theme.colors.dangerSoft,
    fontSize: 13,
    fontWeight: theme.fontWeights.semibold,
    textAlign: 'center',
  },
  statCard: {
    position: 'absolute',
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 18,
    justifyContent: 'center',
  },
  gamesCard: {
    left: 20,
    top: 132,
    width: 168,
    height: 110,
  },
  winsCard: {
    left: 202,
    top: 132,
    width: 168,
    height: 110,
  },
  goalsCard: {
    left: 20,
    top: 258,
    width: 110,
    height: 96,
  },
  assistsCard: {
    left: 140,
    top: 258,
    width: 110,
    height: 96,
  },
  cardsCard: {
    left: 260,
    top: 258,
    width: 110,
    height: 96,
  },
  statValue: {
    color: theme.colors.primary,
    fontSize: 40,
    fontWeight: theme.fontWeights.extraBold,
    lineHeight: 44,
  },
  statValueSmall: {
    color: theme.colors.primary,
    fontSize: 32,
    fontWeight: theme.fontWeights.extraBold,
    lineHeight: 36,
  },
  statLabel: {
    marginTop: 6,
    color: '#A6A5B0',
    fontSize: 14,
    fontWeight: theme.fontWeights.semibold,
  },
  sectionTitle: {
    position: 'absolute',
    left: 20,
    top: 380,
    width: 350,
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: theme.fontWeights.extraBold,
  },
  emptyChampionships: {
    position: 'absolute',
    left: 20,
    top: 430,
    width: 350,
    color: '#A6A5B0',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  champRow: {
    position: 'absolute',
    left: 20,
    width: 350,
    height: 76,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 12,
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
  seeAllButton: {
    position: 'absolute',
    left: 20,
    top: 710,
    width: 350,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  seeAllText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: theme.fontWeights.bold,
  },
});
