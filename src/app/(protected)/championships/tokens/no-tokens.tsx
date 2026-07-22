import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { championshipRoutes } from '@/constants/championshipRoutes';
import { tokenRoutes, type TokenFlowReason } from '@/constants/tokenRoutes';
import { theme } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import { PrimaryButton } from '@/features/championships/components/WizardShell';
import { fetchMyTokenBalance } from '@/features/tokens';
import { ApiError } from '@/lib/api/graphql';

function resolveReason(raw: string | string[] | undefined): TokenFlowReason {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === 'card' || value === 'championship' || value === 'general') {
    return value;
  }
  return 'general';
}

const COPY: Record<TokenFlowReason, string> = {
  championship:
    'Você precisa de 1 token para criar um campeonato. Compre avulso ou assine um plano.',
  card:
    'Você precisa de 1 token para desbloquear esta edição da carta. Compre avulso ou assine um plano.',
  general:
    'Você está sem tokens. Compre avulso ou assine um plano para continuar.',
};

export default function NoTokensScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const params = useLocalSearchParams<{ reason?: string }>();
  const reason = useMemo(() => resolveReason(params.reason), [params.reason]);

  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setBalance(await fetchMyTokenBalance(token));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar saldo.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
      </Pressable>

      <View style={styles.iconWrap}>
        <Ionicons name="ticket-outline" size={56} color={theme.colors.primary} />
      </View>
      <Text style={styles.title}>Sem tokens</Text>
      <Text style={styles.subtitle}>{COPY[reason]}</Text>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo atual</Text>
        {loading ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          <Text style={styles.balanceValue}>{balance} tokens</Text>
        )}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton
        label="Comprar tokens"
        onPress={() => router.push(tokenRoutes.buyWithReason(reason) as never)}
      />
      <Pressable
        onPress={() => router.push(championshipRoutes.subscriptions as never)}
        style={styles.linkBtn}
      >
        <Text style={styles.link}>Ser membro VIP</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 24,
    gap: 14,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    marginTop: 24,
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: theme.fontWeights.extraBold,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  balanceCard: {
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    marginVertical: 8,
  },
  balanceLabel: {
    color: theme.colors.textDim,
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: theme.fontWeights.semibold,
  },
  balanceValue: {
    color: theme.colors.primarySoft,
    fontSize: 28,
    fontWeight: theme.fontWeights.extraBold,
  },
  linkBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  link: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeights.bold,
    fontSize: 15,
  },
  error: {
    color: theme.colors.dangerSoft,
    textAlign: 'center',
  },
});
