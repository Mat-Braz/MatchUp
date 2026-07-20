import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
import { teamRoutes } from '@/constants/teamRoutes';

export default function MyTeamsScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const [teams, setTeams] = useState<MyTeamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTeams = useCallback(async () => {
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
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar seus times.',
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadTeams();
  }, [loadTeams]);

  const canvasHeight = Math.max(844, 180 + teams.length * 100 + 120 + 80);

  return (
    <PencilScreen scroll canvasHeight={canvasHeight}>
      <AuthHeader title="Meus Times" onBack={() => router.back()} />
      <Text style={styles.subtitle}>
        Toque em um time para ver ou editar dados, convites e formação.
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

      {!loading && !error ? (
        <View style={styles.list}>
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

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(teamRoutes.form as never)}
            style={({ pressed }) => [
              styles.createCard,
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
        </View>
      ) : null}

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
  list: {
    position: 'absolute',
    left: 20,
    top: 132,
    width: 350,
    gap: 12,
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
    height: 80,
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
});
