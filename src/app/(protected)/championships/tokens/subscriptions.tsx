import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { championshipRoutes } from '@/constants/championshipRoutes';
import { theme } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import { useChampionshipWizard } from '@/features/championships';
import { PrimaryButton } from '@/features/championships/components/WizardShell';
import {
  fetchSubscriptionCatalog,
  subscribePlan,
  type SubscriptionPlan,
  type SubscriptionPlanOffer,
} from '@/features/subscriptions';
import { ApiError } from '@/lib/api/graphql';
import { formatCurrencyBRL } from '@/lib/masks';

export default function SubscriptionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const { setLastPurchase } = useChampionshipWizard();

  const [catalog, setCatalog] = useState<SubscriptionPlanOffer[]>([]);
  const [selected, setSelected] = useState<SubscriptionPlan>('YEARLY');
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const items = await fetchSubscriptionCatalog(token);
      setCatalog(items);
      setSelected(items.find((i) => i.plan === 'YEARLY')?.plan ?? items[0]?.plan ?? 'MONTHLY');
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar planos.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubscribe() {
    if (!token || subscribing) {
      return;
    }
    setSubscribing(true);
    setError(null);
    try {
      const result = await subscribePlan(token, selected);
      setLastPurchase(result);
      router.replace(championshipRoutes.tokensAdded as never);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha na assinatura mock.');
    } finally {
      setSubscribing(false);
    }
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
      </Pressable>
      <Text style={styles.title}>Assinaturas</Text>
      <Text style={styles.subtitle}>
        Receba tokens automaticamente a cada ciclo. Pagamento simulado.
      </Text>

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.list}>
          {catalog.map((offer) => {
            const active = selected === offer.plan;
            const period = offer.plan === 'YEARLY' ? '/ano' : '/mês';
            return (
              <Pressable
                key={offer.plan}
                onPress={() => setSelected(offer.plan)}
                style={[styles.card, active && styles.cardActive]}
              >
                <View>
                  <Text style={[styles.cardTitle, active && styles.cardTitleActive]}>
                    {offer.label}
                    {offer.plan === 'YEARLY' ? ' · Melhor custo' : ''}
                  </Text>
                  <Text style={styles.cardMeta}>
                    {offer.tokensPerCycle} tokens por ciclo
                  </Text>
                </View>
                <Text style={styles.cardPrice}>
                  {formatCurrencyBRL(offer.priceCents)}
                  {period}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.footer}>
        <PrimaryButton
          label={subscribing ? 'Assinando...' : 'Assinar agora'}
          disabled={subscribing || loading || catalog.length === 0}
          onPress={handleSubscribe}
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
    gap: 8,
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
  cardMeta: {
    color: theme.colors.textDim,
    fontSize: 13,
    marginTop: 4,
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
