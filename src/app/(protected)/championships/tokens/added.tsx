import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { championshipRoutes } from '@/constants/championshipRoutes';
import { protectedProfileRoutes } from '@/constants/protectedProfileRoutes';
import { type TokenFlowReason } from '@/constants/tokenRoutes';
import { theme } from '@/constants/theme';
import { PrimaryButton } from '@/features/championships/components/WizardShell';

function resolveReason(raw: string | string[] | undefined): TokenFlowReason {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === 'card' || value === 'championship' || value === 'general') {
    return value;
  }
  return 'general';
}

function toNumber(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export default function TokensAddedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    reason?: string;
    credited?: string;
    balance?: string;
  }>();

  const reason = useMemo(() => resolveReason(params.reason), [params.reason]);
  const credited = useMemo(() => toNumber(params.credited), [params.credited]);
  const balance = useMemo(() => toNumber(params.balance), [params.balance]);

  const primary = useMemo(() => {
    if (reason === 'championship') {
      return {
        label: 'Continuar criando',
        onPress: () =>
          router.replace(championshipRoutes.createStep(5) as never),
      };
    }
    if (reason === 'card') {
      return {
        label: 'Voltar para Minha Carta',
        onPress: () =>
          router.replace(protectedProfileRoutes.myCard as never),
      };
    }
    return {
      label: 'Continuar',
      onPress: () => router.back(),
    };
  }, [reason, router]);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.iconWrap}>
        <Ionicons name="checkmark-circle" size={72} color={theme.colors.primary} />
      </View>
      <Text style={styles.title}>Tokens adicionados</Text>
      <Text style={styles.subtitle}>Crédito aplicado com sucesso à sua conta.</Text>

      <View style={styles.card}>
        <Text style={styles.rowLabel}>Crédito</Text>
        <Text style={styles.rowValue}>
          {credited} token{credited === 1 ? '' : 's'}
        </Text>
        <Text style={[styles.rowLabel, { marginTop: 12 }]}>Novo saldo</Text>
        <Text style={styles.balance}>{balance} tokens</Text>
      </View>

      <PrimaryButton label={primary.label} onPress={primary.onPress} />

      {reason === 'championship' ? (
        <Pressable
          onPress={() => router.replace(championshipRoutes.create as never)}
          style={styles.linkBtn}
        >
          <Text style={styles.link}>Voltar ao início do wizard</Text>
        </Pressable>
      ) : (
        <Pressable onPress={() => router.back()} style={styles.linkBtn}>
          <Text style={styles.link}>Voltar</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 24,
    justifyContent: 'center',
    gap: 14,
  },
  iconWrap: {
    alignItems: 'center',
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
    marginBottom: 8,
  },
  card: {
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    marginBottom: 8,
  },
  rowLabel: {
    color: theme.colors.textDim,
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: theme.fontWeights.semibold,
  },
  rowValue: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: theme.fontWeights.bold,
    marginTop: 4,
  },
  balance: {
    color: theme.colors.primarySoft,
    fontSize: 28,
    fontWeight: theme.fontWeights.extraBold,
    marginTop: 4,
  },
  linkBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  link: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeights.bold,
  },
});
