import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';

import { theme } from '@/constants/theme';
import {
  AuthHeader,
  ConfirmationOverlay,
  HomeIndicator,
  PencilButton,
  PencilScreen,
  useAuth,
} from '@/features/auth';
import {
  CARD_ATTRIBUTE_KEYS,
  CARD_ATTRIBUTE_LABELS,
  PlayerCard,
  allocatePlayerCardPoints,
  fetchMyPlayerCard,
  resetPlayerCardPoints,
  type CardAttributeKey,
  type PlayerCardAttributes,
  type PlayerCardView,
} from '@/features/player-card';
import { ApiError } from '@/lib/api/graphql';

const ATTR_BASE = 52;

function computeLiveOverall(attrs: PlayerCardAttributes): number {
  const avg =
    CARD_ATTRIBUTE_KEYS.reduce((sum, key) => sum + attrs[key], 0) / 6;
  return Math.min(99, Math.max(55, Math.round(avg)));
}

export default function CardPointsScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const [card, setCard] = useState<PlayerCardView | null>(null);
  const [draftSpent, setDraftSpent] = useState<PlayerCardAttributes | null>(
    null,
  );
  const [booleans, setBooleans] = useState({
    loading: true,
    saving: false,
    resetting: false,
    showResetConfirm: false,
  });
  const [error, setError] = useState<string | null>(null);

  const { loading, saving, resetting, showResetConfirm } = booleans;

  const load = useCallback(async () => {
    if (!token) {
      setBooleans((current) => ({ ...current, loading: false }));
      return;
    }

    setBooleans((current) => ({ ...current, loading: true }));
    setError(null);

    try {
      const next = await fetchMyPlayerCard(token);
      setCard(next);
      setDraftSpent({ ...next.spent });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar os pontos da carta.',
      );
    } finally {
      setBooleans((current) => ({ ...current, loading: false }));
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const liveAttrs = useMemo<PlayerCardAttributes | null>(() => {
    if (!draftSpent) {
      return null;
    }
    return {
      pace: ATTR_BASE + draftSpent.pace,
      shooting: ATTR_BASE + draftSpent.shooting,
      passing: ATTR_BASE + draftSpent.passing,
      dribbling: ATTR_BASE + draftSpent.dribbling,
      defense: ATTR_BASE + draftSpent.defense,
      physical: ATTR_BASE + draftSpent.physical,
    };
  }, [draftSpent]);

  const totalSpent = useMemo(() => {
    if (!draftSpent) {
      return 0;
    }
    return CARD_ATTRIBUTE_KEYS.reduce((sum, key) => sum + draftSpent[key], 0);
  }, [draftSpent]);

  const remaining = card ? Math.max(0, card.spendablePoints - totalSpent) : 0;
  const liveOverall = liveAttrs ? computeLiveOverall(liveAttrs) : 55;

  function adjust(key: CardAttributeKey, delta: number) {
    if (!draftSpent || !card) {
      return;
    }

    const nextValue = draftSpent[key] + delta;
    if (nextValue < 0) {
      return;
    }
    if (ATTR_BASE + nextValue > 99) {
      return;
    }
    if (delta > 0 && remaining <= 0) {
      return;
    }

    setDraftSpent({ ...draftSpent, [key]: nextValue });
  }

  async function handleSave() {
    if (!token || !draftSpent || saving) {
      return;
    }

    setBooleans((current) => ({ ...current, saving: true }));
    setError(null);

    try {
      const next = await allocatePlayerCardPoints(token, draftSpent);
      setCard(next);
      setDraftSpent({ ...next.spent });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível salvar a distribuição.',
      );
    } finally {
      setBooleans((current) => ({ ...current, saving: false }));
    }
  }

  async function handleReset() {
    if (!token || resetting) {
      return;
    }

    setBooleans((current) => ({ ...current, resetting: true }));
    setError(null);

    try {
      const next = await resetPlayerCardPoints(token);
      setCard(next);
      setDraftSpent({ ...next.spent });
      setBooleans((current) => ({
        ...current,
        showResetConfirm: false,
        resetting: false,
      }));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível resetar os pontos.',
      );
      setBooleans((current) => ({ ...current, resetting: false }));
    }
  }

  return (
    <PencilScreen scroll canvasHeight={1180}>
      <AuthHeader title="Distribuir pontos" onBack={() => router.back()} />
      <Text style={styles.subtitle}>
        Cada ponto sobe +1 em um atributo. Overall ao vivo atualiza conforme você
        aloca.
      </Text>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : null}

      {!loading && error ? <Text style={styles.error}>{error}</Text> : null}

      {!loading && card && draftSpent && liveAttrs ? (
        <>
          <View style={styles.preview}>
            <PlayerCard
              name={card.name}
              avatarUrl={card.avatarUrl}
              overall={liveOverall}
              background={card.background}
              shape={card.shape}
              attributes={liveAttrs}
              width={180}
            />
          </View>

          <View style={styles.pointsBar}>
            <Text style={styles.pointsText}>
              Restantes: {remaining} · Overall: {liveOverall}
            </Text>
          </View>

          {CARD_ATTRIBUTE_KEYS.map((key, index) => (
            <View
              key={key}
              style={[styles.attrRow, { top: 470 + index * 72 }]}
            >
              <View style={styles.attrInfo}>
                <Text style={styles.attrLabel}>
                  {CARD_ATTRIBUTE_LABELS[key]}
                </Text>
                <Text style={styles.attrValue}>
                  {liveAttrs[key]}
                  <Text style={styles.attrSpent}>
                    {' '}
                    (+{draftSpent[key]})
                  </Text>
                </Text>
              </View>
              <View style={styles.attrControls}>
                <Pressable
                  style={styles.stepBtn}
                  onPress={() => adjust(key, -1)}
                  disabled={draftSpent[key] <= 0 || saving}
                >
                  <Ionicons name="remove" size={18} color="#FFFFFF" />
                </Pressable>
                <Pressable
                  style={[
                    styles.stepBtn,
                    styles.stepBtnPlus,
                    remaining <= 0 && styles.stepBtnDisabled,
                  ]}
                  onPress={() => adjust(key, 1)}
                  disabled={
                    remaining <= 0 ||
                    ATTR_BASE + draftSpent[key] >= 99 ||
                    saving
                  }
                >
                  <Ionicons name="add" size={18} color="#0A0A0A" />
                </Pressable>
              </View>
            </View>
          ))}

          <PencilButton
            label={saving ? 'Salvando...' : 'Salvar'}
            top={920}
            onPress={() => void handleSave()}
            disabled={saving || resetting}
          />

          <PencilButton
            label="Resetar pontos"
            top={990}
            tone="danger"
            onPress={() =>
              setBooleans((current) => ({
                ...current,
                showResetConfirm: true,
              }))
            }
            disabled={saving || resetting}
          />
        </>
      ) : null}

      {showResetConfirm ? (
        <ConfirmationOverlay
          variant="danger"
          title="Resetar pontos?"
          message={`Todas as alocações serão zeradas\ne os pontos voltarão para o saldo.`}
          buttonLabel={resetting ? 'Resetando...' : 'RESETAR'}
          cancelLabel="Cancelar"
          icon={<Ionicons name="refresh-outline" size={28} color="#FFFFFF" />}
          onPress={() => void handleReset()}
          onCancel={() =>
            !resetting &&
            setBooleans((current) => ({
              ...current,
              showResetConfirm: false,
            }))
          }
        />
      ) : null}

      <HomeIndicator />
    </PencilScreen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    position: 'absolute',
    left: 24,
    top: 108,
    width: 342,
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: theme.fontWeights.semibold,
    lineHeight: 18,
  },
  loadingBox: {
    position: 'absolute',
    left: 24,
    top: 200,
    width: 342,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    position: 'absolute',
    left: 24,
    top: 160,
    width: 342,
    color: theme.colors.dangerSoft,
    fontSize: 13,
    fontWeight: theme.fontWeights.semibold,
    textAlign: 'center',
  },
  preview: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 150,
    alignItems: 'center',
  },
  pointsBar: {
    position: 'absolute',
    left: 24,
    top: 420,
    width: 342,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsText: {
    color: theme.colors.primarySoft,
    fontSize: 13,
    fontWeight: theme.fontWeights.bold,
  },
  attrRow: {
    position: 'absolute',
    left: 24,
    width: 342,
    height: 64,
    borderRadius: 14,
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  attrInfo: {
    flex: 1,
    gap: 2,
  },
  attrLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: theme.fontWeights.semibold,
  },
  attrValue: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: theme.fontWeights.bold,
    fontFamily: theme.fonts.data,
  },
  attrSpent: {
    color: theme.colors.textDim,
    fontSize: 13,
    fontWeight: theme.fontWeights.semibold,
  },
  attrControls: {
    flexDirection: 'row',
    gap: 8,
  },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnPlus: {
    backgroundColor: theme.colors.primary,
  },
  stepBtnDisabled: {
    opacity: 0.4,
  },
});
