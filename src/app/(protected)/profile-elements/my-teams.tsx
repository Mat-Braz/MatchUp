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
import { AuthHeader, HomeIndicator, PencilScreen, useAuth } from '@/features/auth';
import {
  fetchMyTeams,
  formatTeamSubtitle,
  type MyTeamItem,
} from '@/features/teams';
import { ApiError } from '@/lib/api/graphql';

export default function MyTeamsScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const [teams, setTeams] = useState<MyTeamItem[]>([]);
  const [booleans, setBooleans] = useState({
    loading: true,
  });
  const [error, setError] = useState<string | null>(null);

  const { loading } = booleans;

  const loadTeams = useCallback(async () => {
    if (!token) {
      setBooleans({ loading: false });
      return;
    }

    setBooleans({ loading: true });
    setError(null);

    try {
      const data = await fetchMyTeams(token);
      setTeams(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar seus times.',
      );
    } finally {
      setBooleans({ loading: false });
    }
  }, [token]);

  useEffect(() => {
    void loadTeams();
  }, [loadTeams]);

  const canvasHeight = Math.max(844, 180 + teams.length * 92 + 80);

  return (
    <PencilScreen scroll canvasHeight={canvasHeight}>
      <AuthHeader title="Meus Times" onBack={() => router.back()} />
      <Text style={styles.subtitle}>
        Times vinculados aos seus campeonatos e inscrições.
      </Text>

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

      {!loading && !error
        ? teams.map((team, index) => (
            <Pressable
              key={team.id}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.teamRow,
                { top: 132 + index * 92 },
                pressed && styles.teamRowPressed,
              ]}
            >
              <View style={styles.teamIcon}>
                <Ionicons name="shield-outline" size={22} color={theme.colors.primary} />
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
          ))
        : null}

      <HomeIndicator top={canvasHeight - 24} />
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
  empty: {
    position: 'absolute',
    left: 20,
    top: 180,
    width: 350,
    color: '#A6A5B0',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    textAlign: 'center',
  },
  teamRow: {
    position: 'absolute',
    left: 20,
    width: 350,
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
  teamRowPressed: {
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
});
