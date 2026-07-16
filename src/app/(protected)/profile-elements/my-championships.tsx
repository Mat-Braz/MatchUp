import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  fetchMyProfileChampionships,
  formatMyChampionshipSubtitle,
  type MyChampionshipItem,
  type MyChampionshipsScope,
} from '@/features/championships';
import { ApiError } from '@/lib/api/graphql';

const TABS: { key: MyChampionshipsScope; label: string }[] = [
  { key: 'ALL', label: 'Todos' },
  { key: 'PARTICIPATING', label: 'Participando' },
  { key: 'CREATED', label: 'Criados' },
];

export default function MyChampionshipsScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const [scope, setScope] = useState<MyChampionshipsScope>('ALL');
  const [items, setItems] = useState<MyChampionshipItem[]>([]);
  const [booleans, setBooleans] = useState({
    loading: true,
  });
  const [error, setError] = useState<string | null>(null);

  const { loading } = booleans;

  const loadChampionships = useCallback(async () => {
    if (!token) {
      setBooleans({ loading: false });
      return;
    }

    setBooleans({ loading: true });
    setError(null);

    try {
      const data = await fetchMyProfileChampionships(token, scope);
      setItems(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar seus campeonatos.',
      );
    } finally {
      setBooleans({ loading: false });
    }
  }, [scope, token]);

  useEffect(() => {
    void loadChampionships();
  }, [loadChampionships]);

  const listTop = 188;
  const createTop = listTop + Math.max(items.length, 1) * 92 + (items.length === 0 ? 40 : 16);
  const canvasHeight = Math.max(844, createTop + 120);

  return (
    <PencilScreen scroll canvasHeight={canvasHeight}>
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

      {loading ? (
        <View style={[styles.loadingBox, { top: listTop }]}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : null}

      {!loading && error ? (
        <Text style={[styles.error, { top: listTop }]}>{error}</Text>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <Text style={[styles.empty, { top: listTop }]}>
          Nenhum campeonato encontrado nesse filtro.
        </Text>
      ) : null}

      {!loading && !error
        ? items.map((item, index) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.champRow,
                { top: listTop + index * 92 },
                pressed && styles.rowPressed,
              ]}
            >
              <View style={styles.champIcon}>
                <Ionicons name="trophy-outline" size={20} color={theme.colors.primary} />
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
          ))
        : null}

      {!loading ? (
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            Alert.alert('Em breve', 'A criação de campeonatos estará disponível em breve.')
          }
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
  loadingBox: {
    position: 'absolute',
    left: 20,
    width: 350,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    position: 'absolute',
    left: 20,
    width: 350,
    color: theme.colors.dangerSoft,
    fontSize: 13,
    fontWeight: theme.fontWeights.semibold,
    textAlign: 'center',
  },
  empty: {
    position: 'absolute',
    left: 20,
    width: 350,
    color: '#A6A5B0',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    textAlign: 'center',
  },
  champRow: {
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
  createCard: {
    position: 'absolute',
    left: 20,
    width: 350,
    minHeight: 88,
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
});
