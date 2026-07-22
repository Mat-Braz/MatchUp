import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';

import { protectedProfileRoutes } from '@/constants/protectedProfileRoutes';
import { tokenRoutes } from '@/constants/tokenRoutes';
import { theme } from '@/constants/theme';
import { AuthHeader, HomeIndicator, PencilButton, PencilScreen, useAuth } from '@/features/auth';
import {
  ALL_BACKGROUNDS,
  ALL_SHAPES,
  BACKGROUND_LABELS,
  PlayerCard,
  SHAPE_LABELS,
  fetchMyPlayerCard,
  isPurchasableBackground,
  isPurchasableShape,
  normalizeCardShape,
  purchasePlayerCardBackground,
  purchasePlayerCardShape,
  updateMyPlayerCard,
  type CardBackground,
  type CardShape,
  type PlayerCardView,
} from '@/features/player-card';
import { fetchMyTokenBalance } from '@/features/tokens/api/tokens';
import { ApiError } from '@/lib/api/graphql';

type PendingPurchase =
  | { kind: 'background'; value: CardBackground }
  | { kind: 'shape'; value: CardShape };

const BG_SWATCH: Record<CardBackground, string> = {
  BRONZE: '#A66B3A',
  SILVER: '#9AA3B2',
  GOLD: '#D4AF37',
  PURPLE: '#7C3AED',
  BLACK: '#1A1A1A',
  PINK: '#DB2777',
  GREEN: '#16A34A',
};

export default function MyCardScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const [card, setCard] = useState<PlayerCardView | null>(null);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [booleans, setBooleans] = useState({
    loading: true,
    saving: false,
    purchasing: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [pendingPurchase, setPendingPurchase] = useState<PendingPurchase | null>(
    null,
  );

  const { loading, saving, purchasing } = booleans;

  const load = useCallback(async () => {
    if (!token) {
      setBooleans((current) => ({ ...current, loading: false }));
      return;
    }

    setBooleans((current) => ({ ...current, loading: true }));
    setError(null);

    try {
      const [nextCard, balance] = await Promise.all([
        fetchMyPlayerCard(token),
        fetchMyTokenBalance(token),
      ]);
      setCard(nextCard);
      setTokenBalance(balance);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar sua carta.',
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

  function goBuyTokens() {
    router.push(tokenRoutes.noTokensWithReason('card') as never);
  }

  async function handleShape(shape: CardShape) {
    if (!token || !card || saving || purchasing) {
      return;
    }

    const unlocked = (card.unlockedShapes ?? ['SQUARE']).includes(shape);
    if (!unlocked) {
      if (isPurchasableShape(shape)) {
        setPendingPurchase({ kind: 'shape', value: shape });
      }
      return;
    }

    if (normalizeCardShape(card.shape) === shape) {
      return;
    }

    setBooleans((current) => ({ ...current, saving: true }));
    setError(null);
    try {
      const next = await updateMyPlayerCard(token, { shape });
      setCard(next);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível alterar o formato.',
      );
    } finally {
      setBooleans((current) => ({ ...current, saving: false }));
    }
  }

  async function handleBackground(background: CardBackground) {
    if (!token || !card || saving || purchasing) {
      return;
    }

    const unlocked = card.unlockedBackgrounds.includes(background);
    if (!unlocked) {
      if (isPurchasableBackground(background)) {
        setPendingPurchase({ kind: 'background', value: background });
      }
      return;
    }

    if (card.background === background) {
      return;
    }

    setBooleans((current) => ({ ...current, saving: true }));
    setError(null);
    try {
      const next = await updateMyPlayerCard(token, { background });
      setCard(next);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível alterar o fundo.',
      );
    } finally {
      setBooleans((current) => ({ ...current, saving: false }));
    }
  }

  async function confirmPurchase() {
    if (!token || !pendingPurchase || purchasing) {
      return;
    }

    if (tokenBalance < 1) {
      setPendingPurchase(null);
      goBuyTokens();
      return;
    }

    setBooleans((current) => ({ ...current, purchasing: true }));
    setError(null);

    try {
      if (pendingPurchase.kind === 'background') {
        await purchasePlayerCardBackground(token, pendingPurchase.value);
        const selected = await updateMyPlayerCard(token, {
          background: pendingPurchase.value,
        });
        setCard(selected);
      } else {
        await purchasePlayerCardShape(token, pendingPurchase.value);
        const selected = await updateMyPlayerCard(token, {
          shape: pendingPurchase.value,
        });
        setCard(selected);
      }
      setTokenBalance((current) => Math.max(0, current - 1));
      setPendingPurchase(null);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Não foi possível concluir a compra.';

      if (message.includes('INSUFFICIENT_TOKENS')) {
        setPendingPurchase(null);
        goBuyTokens();
        return;
      }

      setError(message);
    } finally {
      setBooleans((current) => ({ ...current, purchasing: false }));
    }
  }

  const pendingLabel =
    pendingPurchase?.kind === 'background'
      ? BACKGROUND_LABELS[pendingPurchase.value]
      : pendingPurchase
        ? SHAPE_LABELS[pendingPurchase.value]
        : '';

  return (
    <PencilScreen scroll canvasHeight={1185}>
      <AuthHeader title="Minha Carta" onBack={() => router.back()} />
      <Text style={styles.subtitle}>
        Personalize formato, fundo e foto. Distribua pontos para subir o overall.
      </Text>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : null}

      {!loading && error ? <Text style={styles.error}>{error}</Text> : null}

      {!loading && card ? (
        <>
          <View style={styles.cardPreview}>
            <PlayerCard
              name={card.name}
              avatarUrl={card.avatarUrl}
              overall={card.overall}
              background={card.background}
              shape={normalizeCardShape(card.shape)}
              attributes={card.attributes}
              width={248}
            />
          </View>

          <Text style={styles.meta}>
            Pontos disponíveis: {card.remainingPoints}/{card.spendablePoints}
          </Text>

          <Text style={styles.sectionLabel}>Formato</Text>
          <View style={styles.shapeRow}>
            {ALL_SHAPES.map((shape) => {
              const unlocked = (
                card.unlockedShapes ?? ['SQUARE']
              ).includes(shape);
              const active = normalizeCardShape(card.shape) === shape;
              const purchasable = isPurchasableShape(shape) && !unlocked;

              return (
                <Pressable
                  key={shape}
                  style={[
                    styles.shapeChip,
                    active && styles.shapeChipActive,
                    !unlocked && styles.shapeChipLocked,
                  ]}
                  onPress={() => void handleShape(shape)}
                  disabled={saving || purchasing}
                >
                  <Text
                    style={[
                      styles.shapeChipText,
                      active && styles.shapeChipTextActive,
                    ]}
                  >
                    {SHAPE_LABELS[shape]}
                  </Text>
                  {purchasable ? (
                    <Text style={styles.shapeBuyHint}>1 token</Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.sectionLabel, styles.bgLabel]}>Fundos</Text>
          <View style={styles.bgGrid}>
            {ALL_BACKGROUNDS.map((bg) => {
              const unlocked = (card.unlockedBackgrounds ?? []).includes(bg);
              const selected = card.background === bg;
              const purchasable = isPurchasableBackground(bg) && !unlocked;

              return (
                <Pressable
                  key={bg}
                  style={[
                    styles.bgItem,
                    selected && styles.bgItemSelected,
                    !unlocked && styles.bgItemLocked,
                  ]}
                  onPress={() => void handleBackground(bg)}
                  disabled={saving || purchasing}
                >
                  <View
                    style={[
                      styles.bgSwatch,
                      selected && styles.bgSwatchSelected,
                      { backgroundColor: BG_SWATCH[bg] },
                    ]}
                  />
                  <Text style={styles.bgName} numberOfLines={1}>
                    {BACKGROUND_LABELS[bg]}
                  </Text>
                  {!unlocked ? (
                    <View style={styles.lockBadge}>
                      <Ionicons
                        name={purchasable ? 'diamond-outline' : 'lock-closed'}
                        size={12}
                        color="#FFFFFF"
                      />
                    </View>
                  ) : null}
                  {purchasable ? (
                    <Text style={styles.buyHint}>1 token</Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          <PencilButton
            label="Distribuir pontos"
            top={900}
            onPress={() =>
              router.push(protectedProfileRoutes.distributePoints as never)
            }
          />

          <Pressable
            style={styles.photoLink}
            onPress={() =>
              router.push(protectedProfileRoutes.editProfile as never)
            }
          >
            <Ionicons
              name="camera-outline"
              size={16}
              color={theme.colors.primary}
            />
            <Text style={styles.photoLinkText}>Alterar foto no perfil</Text>
          </Pressable>
        </>
      ) : null}

      {pendingPurchase ? (
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>
              Comprar {pendingPurchase.kind === 'shape' ? 'formato' : 'fundo'}?
            </Text>
            <Text style={styles.confirmMessage}>
              Desbloquear {pendingLabel} por 1 token.
              {'\n'}Saldo atual: {tokenBalance}
            </Text>
            <PencilButton
              label={purchasing ? 'Comprando...' : 'Comprar (1 token)'}
              onPress={() => void confirmPurchase()}
              disabled={purchasing}
              style={styles.confirmBtn}
            />
            <Pressable
              onPress={() => !purchasing && setPendingPurchase(null)}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <HomeIndicator top={1160} />
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
    height: 180,
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
  cardPreview: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 150,
    alignItems: 'center',
  },
  meta: {
    position: 'absolute',
    left: 24,
    top: 545,
    width: 342,
    textAlign: 'center',
    color: theme.colors.textDim,
    fontSize: 12,
    fontWeight: theme.fontWeights.semibold,
  },
  sectionLabel: {
    position: 'absolute',
    left: 24,
    top: 575,
    width: 342,
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: theme.fontWeights.bold,
  },
  shapeRow: {
    position: 'absolute',
    left: 24,
    top: 603,
    width: 342,
    flexDirection: 'row',
    gap: 8,
  },
  shapeChip: {
    flex: 1,
    minHeight: 48,
    borderRadius: theme.radius.button,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  shapeChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: '#00FF0018',
  },
  shapeChipLocked: {
    opacity: 0.75,
  },
  shapeChipText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: theme.fontWeights.semibold,
    textAlign: 'center',
  },
  shapeChipTextActive: {
    color: theme.colors.primary,
  },
  shapeBuyHint: {
    color: theme.colors.primarySoft,
    fontSize: 9,
    fontWeight: theme.fontWeights.bold,
    marginTop: 2,
  },
  bgLabel: {
    top: 669,
  },
  bgGrid: {
    position: 'absolute',
    left: 24,
    top: 697,
    width: 342,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  bgItem: {
    width: 74,
    alignItems: 'center',
    gap: 4,
  },
  bgItemSelected: {
    opacity: 1,
  },
  bgItemLocked: {
    opacity: 0.72,
  },
  bgSwatch: {
    width: 74,
    height: 56,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  bgSwatchSelected: {
    borderColor: theme.colors.primary,
  },
  bgName: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: theme.fontWeights.semibold,
  },
  buyHint: {
    color: theme.colors.primarySoft,
    fontSize: 9,
    fontWeight: theme.fontWeights.bold,
  },
  lockBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoLink: {
    position: 'absolute',
    left: 24,
    top: 1015,
    width: 342,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoLinkText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: theme.fontWeights.semibold,
  },
  confirmOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  confirmCard: {
    width: 320,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 20,
    gap: 12,
  },
  confirmTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: theme.fontWeights.bold,
    textAlign: 'center',
  },
  confirmMessage: {
    color: theme.colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  confirmBtn: {
    marginTop: 4,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelText: {
    color: theme.colors.textDim,
    fontSize: 13,
    fontWeight: theme.fontWeights.semibold,
  },
});
