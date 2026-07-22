import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { tokenRoutes, type TokenFlowReason } from '@/constants/tokenRoutes';
import { theme } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import { PrimaryButton } from '@/features/championships/components/WizardShell';
import {
  fetchTokenCatalog,
  purchaseTokenPack,
  type TokenPack,
  type TokenPackOffer,
} from '@/features/tokens';
import { ApiError } from '@/lib/api/graphql';
import { formatCurrencyBRL } from '@/lib/masks';

function resolveReason(raw: string | string[] | undefined): TokenFlowReason {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === 'card' || value === 'championship' || value === 'general') {
    return value;
  }
  return 'general';
}

export default function BuyTokensScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const params = useLocalSearchParams<{ reason?: string }>();
  const reason = useMemo(() => resolveReason(params.reason), [params.reason]);

  const [catalog, setCatalog] = useState<TokenPackOffer[]>([]);
  const [selected, setSelected] = useState<TokenPack>('TEN');
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const items = await fetchTokenCatalog(token);
      setCatalog(items);
      if (items[0]) {
        setSelected(items.find((i) => i.pack === 'TEN')?.pack ?? items[0].pack);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar pacotes.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleBuy() {
    if (!token || buying) {
      return;
    }
    setBuying(true);
    setError(null);
    try {
      const result = await purchaseTokenPack(token, selected);
      router.replace(
        tokenRoutes.addedWithParams({
          reason,
          credited: result.credited,
          balance: result.balance,
        }) as never,
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha na compra mock.');
    } finally {
      setBuying(false);
    }
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
      </Pressable>
      <Text style={styles.title}>Comprar tokens</Text>
      <Text style={styles.subtitle}>Pagamento simulado — os tokens são creditados na hora.</Text>

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.list}>
          {catalog.map((offer) => {
            const active = selected === offer.pack;
            return (
              <Pressable
                key={offer.pack}
                onPress={() => setSelected(offer.pack)}
                style={[styles.card, active && styles.cardActive]}
              >
                <Text style={[styles.cardTitle, active && styles.cardTitleActive]}>
                  {offer.label}
                </Text>
                <Text style={styles.cardPrice}>
                  {formatCurrencyBRL(offer.priceCents)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.footer}>
        <PrimaryButton
          label={buying ? 'Processando...' : 'Ir para o pagamento'}
          disabled={buying || loading || catalog.length === 0}
          onPress={handleBuy}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 20,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: theme.fontWeights.extraBold,
    marginTop: 8,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 14,
    marginTop: 6,
    marginBottom: 20,
  },
  list: {
    gap: 12,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceCard,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: '#0F2A0F',
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: theme.fontWeights.bold,
  },
  cardTitleActive: {
    color: theme.colors.primarySoft,
  },
  cardPrice: {
    color: theme.colors.textMuted,
    fontSize: 15,
    fontWeight: theme.fontWeights.semibold,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
  },
  error: {
    color: theme.colors.dangerSoft,
    marginTop: 12,
  },
});
