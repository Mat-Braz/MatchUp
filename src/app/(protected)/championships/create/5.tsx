import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useRouter } from 'expo-router';

import { championshipRoutes } from '@/constants/championshipRoutes';
import { tokenRoutes } from '@/constants/tokenRoutes';
import { theme } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import {
  createChampionship,
  updateChampionship,
  useChampionshipWizard,
  type CreateChampionshipInput,
} from '@/features/championships';
import {
  PrimaryButton,
  WizardShell,
} from '@/features/championships/components/WizardShell';
import { fetchMyTokenBalance } from '@/features/tokens';
import { ApiError } from '@/lib/api/graphql';

function parseMoney(value: string): number | undefined {
  const normalized = value.replace(/\./g, '').replace(',', '.').trim();
  if (!normalized) {
    return undefined;
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function formatLabel(type: string | null): string {
  switch (type) {
    case 'ELIMINATORIA':
      return 'Mata-mata';
    case 'PONTOS_CORRIDOS':
      return 'Pontos corridos';
    case 'GRUPOS_MATA_MATA':
      return 'Grupos + Mata-mata';
    default:
      return '—';
  }
}

export default function CreateStep5Screen() {
  const router = useRouter();
  const { token } = useAuth();
  const {
    draft,
    setCreatedChampionshipId,
    editingChampionshipId,
    resetDraft,
  } = useChampionshipWizard();

  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(!editingChampionshipId);
  const [saving, setSaving] = useState(false);
  const isEditing = editingChampionshipId != null;

  const loadBalance = useCallback(async () => {
    if (!token || isEditing) {
      setLoadingBalance(false);
      return;
    }
    setLoadingBalance(true);
    try {
      const value = await fetchMyTokenBalance(token);
      setBalance(value);
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Não foi possível carregar o saldo.',
      );
    } finally {
      setLoadingBalance(false);
    }
  }, [isEditing, token]);

  useEffect(() => {
    void loadBalance();
  }, [loadBalance]);

  async function handleSubmit() {
    if (!token || saving || !draft.championshipType) {
      return;
    }

    if (!isEditing && (balance ?? 0) < 1) {
      router.push(tokenRoutes.noTokensWithReason('championship') as never);
      return;
    }

    setSaving(true);
    setError(null);

    const input: CreateChampionshipInput = {
      name: draft.name.trim(),
      description: draft.description.trim() || undefined,
      city: draft.city.trim(),
      uf: draft.uf.trim().toUpperCase(),
      championshipType: draft.championshipType,
      maxParticipants: draft.maxParticipants,
      hasTrophy: draft.hasTrophy,
      hasMedal: draft.hasMedal,
      hasCashPrize: draft.hasCashPrize,
      prizeFirst: draft.hasCashPrize ? parseMoney(draft.prizeFirst) : undefined,
      prizeSecond: draft.hasCashPrize ? parseMoney(draft.prizeSecond) : undefined,
      prizeThird: draft.hasCashPrize ? parseMoney(draft.prizeThird) : undefined,
      rulesEnabled: draft.rulesEnabled,
      yellowCardLimit: draft.rulesEnabled
        ? Number(draft.yellowCardLimit) || 0
        : undefined,
      redCardLimit: draft.rulesEnabled ? Number(draft.redCardLimit) || 0 : undefined,
      substitutions: draft.rulesEnabled
        ? Number(draft.substitutions) || 0
        : undefined,
      isPublic: draft.isPublic,
    };

    try {
      if (isEditing && editingChampionshipId) {
        await updateChampionship(token, editingChampionshipId, input);
        const id = editingChampionshipId;
        resetDraft();
        router.replace(championshipRoutes.detail(id) as never);
        return;
      }

      const created = await createChampionship(token, input);
      setCreatedChampionshipId(created.id);
      router.replace(championshipRoutes.success as never);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Não foi possível salvar o campeonato.';

      if (message.includes('INSUFFICIENT_TOKENS')) {
        router.push(tokenRoutes.noTokensWithReason('championship') as never);
        return;
      }

      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <WizardShell
      title="Resumo"
      step={5}
      footer={
        <PrimaryButton
          label={
            saving
              ? 'Salvando...'
              : isEditing
                ? 'Salvar alterações'
                : 'Criar campeonato'
          }
          disabled={saving || loadingBalance}
          onPress={handleSubmit}
        />
      }
    >
      <View style={styles.card}>
        <SummaryRow label="Nome" value={draft.name || '—'} />
        <SummaryRow label="Local" value={`${draft.city}/${draft.uf}` || '—'} />
        <SummaryRow
          label="Visibilidade"
          value={draft.isPublic ? 'Público' : 'Privado'}
        />
        <SummaryRow label="Formato" value={formatLabel(draft.championshipType)} />
        <SummaryRow
          label="Participantes"
          value={String(draft.maxParticipants)}
        />
        <SummaryRow
          label="Premiação"
          value={[
            draft.hasTrophy ? 'Troféu' : null,
            draft.hasMedal ? 'Medalha' : null,
            draft.hasCashPrize ? 'Dinheiro' : null,
          ]
            .filter(Boolean)
            .join(', ') || 'Nenhuma'}
        />
        <SummaryRow
          label="Regras"
          value={draft.rulesEnabled ? 'Ativadas' : 'Desativadas'}
        />
      </View>

      {!isEditing ? (
        <View style={styles.costCard}>
          <Text style={styles.costTitle}>Custo de criação</Text>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Tokens necessários</Text>
            <Text style={styles.costValue}>1 token</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Saldo atual</Text>
            {loadingBalance ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <Text style={styles.costValue}>
                {balance ?? 0} token{(balance ?? 0) === 1 ? '' : 's'}
              </Text>
            )}
          </View>
        </View>
      ) : (
        <Text style={styles.editHint}>
          A edição não consome tokens. As alterações valem para o campeonato atual.
        </Text>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </WizardShell>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    gap: 10,
  },
  summaryRow: {
    gap: 2,
  },
  summaryLabel: {
    color: theme.colors.textDim,
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: theme.fontWeights.semibold,
  },
  summaryValue: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: theme.fontWeights.semibold,
  },
  costCard: {
    backgroundColor: '#0F2A0F',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    padding: 14,
    gap: 10,
  },
  costTitle: {
    color: theme.colors.primarySoft,
    fontSize: 14,
    fontWeight: theme.fontWeights.bold,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costLabel: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  costValue: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: theme.fontWeights.bold,
  },
  error: {
    color: theme.colors.dangerSoft,
    fontSize: 13,
    fontWeight: theme.fontWeights.semibold,
  },
  editHint: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
});
