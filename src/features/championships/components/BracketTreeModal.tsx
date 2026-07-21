import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';

import { theme } from '@/constants/theme';
import type { BracketGame, BracketTeam } from '@/features/championships';
import { TeamShield } from './TeamShield';

const BASE_SHIELD = 44;
const BASE_CONNECTOR = 28;
const BASE_MATCH_GAP = 22;
const ZOOM_MIN = 0.4;
const ZOOM_MAX = 1.4;
const ZOOM_STEP = 0.1;

type BracketTreeModalProps = {
  visible: boolean;
  games: BracketGame[];
  maxParticipants?: number | null;
  onClose: () => void;
};

type BracketSlot = {
  key: string;
  round: number;
  position: number;
  isBye: boolean;
  homeTeam: BracketTeam | null;
  awayTeam: BracketTeam | null;
  winnerTeamId: number | null;
};

type RoundRow = {
  round: number;
  label: string;
  slots: BracketSlot[];
};

function sortGames(games: BracketGame[]): BracketGame[] {
  return [...games].sort((a, b) => a.bracketPosition - b.bracketPosition);
}

function nextPowerOf2(value: number): number {
  let size = 2;
  while (size < value) {
    size *= 2;
  }
  return size;
}

function resolveBracketSize(
  maxParticipants: number | null | undefined,
  games: BracketGame[],
): number {
  if (maxParticipants != null && maxParticipants >= 2) {
    return nextPowerOf2(maxParticipants);
  }

  const round1 = games.filter((game) => game.round === 1);
  const leafTeams = round1.reduce(
    (total, game) => total + (game.isBye ? 1 : 2),
    0,
  );
  return nextPowerOf2(Math.max(2, leafTeams || 2));
}

function totalRoundsForSize(bracketSize: number): number {
  return Math.round(Math.log2(bracketSize));
}

function teamsInRound(bracketSize: number, round: number): number {
  return Math.max(2, bracketSize / 2 ** (round - 1));
}

function gamesInRound(bracketSize: number, round: number): number {
  return Math.max(1, bracketSize / 2 ** round);
}

function roundLabel(bracketSize: number, round: number): string {
  const teams = teamsInRound(bracketSize, round);
  if (teams <= 2) {
    return 'FINAL';
  }
  if (teams <= 4) {
    return 'SEMI';
  }
  if (teams <= 8) {
    return 'QUARTAS';
  }
  if (teams <= 16) {
    return 'OITAVAS';
  }
  return `RODADA ${round}`;
}

function gameToSlot(game: BracketGame): BracketSlot {
  return {
    key: `game-${game.id}`,
    round: game.round,
    position: game.bracketPosition,
    isBye: game.isBye,
    homeTeam: game.homeTeam,
    awayTeam: game.isBye ? null : game.awayTeam,
    winnerTeamId: game.winnerTeamId,
  };
}

function placeholderSlot(round: number, position: number): BracketSlot {
  return {
    key: `placeholder-${round}-${position}`,
    round,
    position,
    isBye: false,
    homeTeam: null,
    awayTeam: null,
    winnerTeamId: null,
  };
}

function buildFullSlots(
  games: BracketGame[],
  bracketSize: number,
): Map<number, BracketSlot[]> {
  const byRound = new Map<number, BracketGame[]>();
  for (const game of games) {
    const list = byRound.get(game.round) ?? [];
    list.push(game);
    byRound.set(game.round, list);
  }

  const totalRounds = totalRoundsForSize(bracketSize);
  const result = new Map<number, BracketSlot[]>();

  for (let round = 1; round <= totalRounds; round++) {
    const expected = gamesInRound(bracketSize, round);
    const actual = sortGames(byRound.get(round) ?? []);
    const byPosition = new Map(
      actual.map((game) => [game.bracketPosition, game]),
    );
    const usedIds = new Set<number>();
    const slots: BracketSlot[] = [];

    for (let position = 0; position < expected; position++) {
      const positioned = byPosition.get(position);
      if (positioned && !usedIds.has(positioned.id)) {
        usedIds.add(positioned.id);
        slots.push(gameToSlot(positioned));
        continue;
      }

      const leftover = actual.find((game) => !usedIds.has(game.id));
      if (leftover) {
        usedIds.add(leftover.id);
        slots.push(gameToSlot(leftover));
        continue;
      }

      slots.push(placeholderSlot(round, position));
    }

    result.set(round, slots);
  }

  return result;
}

function matchWidth(zoom: number): number {
  const shield = BASE_SHIELD * zoom;
  return (shield + 8 * zoom) * 2 + BASE_CONNECTOR * zoom;
}

function rowWidth(slotCount: number, zoom: number): number {
  if (slotCount <= 0) {
    return 200 * zoom;
  }
  const gap = BASE_MATCH_GAP * zoom;
  return slotCount * matchWidth(zoom) + (slotCount - 1) * gap;
}

function defaultZoomForBracket(bracketSize: number, viewportWidth: number): number {
  const firstRoundMatches = Math.max(1, bracketSize / 2);
  const needed = rowWidth(firstRoundMatches, 1) + 48;
  const fit = viewportWidth / needed;
  return Math.min(1, Math.max(ZOOM_MIN, Math.round(fit * 100) / 100));
}

function TeamNode({
  team,
  isWinner,
  caption,
  zoom,
}: {
  team: BracketTeam | null | undefined;
  isWinner?: boolean;
  caption?: string | null;
  zoom: number;
}) {
  const shield = Math.max(28, Math.round(BASE_SHIELD * zoom));
  const label =
    caption ??
    (team ? (team.sigla ?? team.name).slice(0, 3).toUpperCase() : '—');

  return (
    <View style={[styles.teamNode, { width: shield + 8 * zoom }]}>
      <View style={styles.shieldWrap}>
        <TeamShield team={team} size={shield} />
        {isWinner ? <View style={styles.winnerDot} /> : null}
      </View>
      <Text style={[styles.teamSigla, { fontSize: Math.max(8, 10 * zoom) }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function MatchNode({ slot, zoom }: { slot: BracketSlot; zoom: number }) {
  const connector = Math.max(18, BASE_CONNECTOR * zoom);

  return (
    <View style={[styles.matchNode, { width: matchWidth(zoom) }]}>
      <TeamNode
        team={slot.homeTeam}
        zoom={zoom}
        isWinner={
          slot.winnerTeamId != null && slot.homeTeam?.id === slot.winnerTeamId
        }
      />
      <View style={[styles.matchConnector, { width: connector }]}>
        <View style={styles.connectorLine} />
        <View style={styles.connectorDiamond} />
        <View style={styles.connectorLine} />
      </View>
      <TeamNode
        team={slot.awayTeam}
        zoom={zoom}
        isWinner={
          slot.winnerTeamId != null && slot.awayTeam?.id === slot.winnerTeamId
        }
        caption={slot.isBye ? 'bye' : undefined}
      />
    </View>
  );
}

function MatchesRow({
  slots,
  zoom,
  width,
}: {
  slots: BracketSlot[];
  zoom: number;
  width: number;
}) {
  return (
    <View
      style={[
        styles.matchesRow,
        {
          width,
          gap: BASE_MATCH_GAP * zoom,
        },
      ]}
    >
      {slots.map((slot) => (
        <MatchNode key={slot.key} slot={slot} zoom={zoom} />
      ))}
    </View>
  );
}

function RoundLabel({ label, width }: { label: string; width: number }) {
  return (
    <View style={[styles.roundLabelWrap, { width }]}>
      <View style={styles.roundLabelLine} />
      <Text style={styles.roundLabelText}>{label}</Text>
      <View style={styles.roundLabelLine} />
    </View>
  );
}

function FinalMatch({ slot, zoom }: { slot: BracketSlot; zoom: number }) {
  return (
    <View style={styles.finalMatch}>
      <TeamNode
        team={slot.homeTeam}
        zoom={zoom}
        isWinner={
          slot.winnerTeamId != null && slot.homeTeam?.id === slot.winnerTeamId
        }
      />
      <Text style={[styles.vsText, { fontSize: Math.max(12, 14 * zoom) }]}>x</Text>
      <TeamNode
        team={slot.awayTeam}
        zoom={zoom}
        isWinner={
          slot.winnerTeamId != null && slot.awayTeam?.id === slot.winnerTeamId
        }
      />
    </View>
  );
}

/** Área separada do campeão — só troféu + escudo do vencedor. */
function ChampionPedestal({
  slot,
  zoom,
}: {
  slot: BracketSlot;
  zoom: number;
}) {
  const champion =
    slot.winnerTeamId != null
      ? slot.homeTeam?.id === slot.winnerTeamId
        ? slot.homeTeam
        : slot.awayTeam?.id === slot.winnerTeamId
          ? slot.awayTeam
          : null
      : null;

  const trophy = Math.max(56, Math.round(72 * zoom));
  const shield = Math.max(48, Math.round(64 * zoom));

  return (
    <View style={styles.championPedestal}>
      <Text style={styles.championPedestalLabel}>CAMPEÃO</Text>
      <View
        style={[
          styles.trophyWrap,
          { width: trophy, height: trophy, borderRadius: trophy / 2 },
        ]}
      >
        <Ionicons
          name="trophy"
          size={Math.max(26, Math.round(38 * zoom))}
          color={theme.colors.primary}
        />
      </View>
      <View style={styles.championShieldFrame}>
        <TeamShield team={champion} size={shield} />
      </View>
      {champion ? (
        <Text style={styles.championName} numberOfLines={2}>
          {champion.name}
        </Text>
      ) : (
        <Text style={styles.awaiting}>Aguardando campeão</Text>
      )}
    </View>
  );
}

export function BracketTreeModal({
  visible,
  games,
  maxParticipants,
  onClose,
}: BracketTreeModalProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const [zoom, setZoom] = useState(1);

  const { roundsAscending, finalSlot, bracketSize, maxRowSlots } = useMemo(() => {
    const size = resolveBracketSize(maxParticipants, games);
    const fullSlots = buildFullSlots(games, size);
    const totalRounds = totalRoundsForSize(size);
    const final = fullSlots.get(totalRounds)?.[0] ?? placeholderSlot(totalRounds, 0);

    // De baixo (rodada 1) para cima (antes da final) — render invertido no JSX
    const ascending: RoundRow[] = [];
    for (let round = 1; round < totalRounds; round++) {
      ascending.push({
        round,
        label: roundLabel(size, round),
        slots: fullSlots.get(round) ?? [],
      });
    }

    const maxSlots = Math.max(
      1,
      ...ascending.map((row) => row.slots.length),
      1,
    );

    return {
      roundsAscending: ascending,
      finalSlot: final,
      bracketSize: size,
      maxRowSlots: maxSlots,
    };
  }, [games, maxParticipants]);

  // Rodadas do topo (perto da final) para a base (1ª rodada)
  const roundsFromTop = useMemo(
    () => [...roundsAscending].reverse(),
    [roundsAscending],
  );

  const viewportWidth = Math.max(280, windowWidth - 48);

  useEffect(() => {
    if (visible) {
      setZoom(defaultZoomForBracket(bracketSize, viewportWidth));
    }
  }, [visible, bracketSize, viewportWidth]);

  const contentWidth = Math.max(
    viewportWidth,
    rowWidth(maxRowSlots, zoom) + 32,
  );

  function zoomOut() {
    setZoom((current) =>
      Math.max(ZOOM_MIN, Math.round((current - ZOOM_STEP) * 100) / 100),
    );
  }

  function zoomIn() {
    setZoom((current) =>
      Math.min(ZOOM_MAX, Math.round((current + ZOOM_STEP) * 100) / 100),
    );
  }

  function zoomFit() {
    setZoom(defaultZoomForBracket(bracketSize, viewportWidth));
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.backdrop, { paddingTop: insets.top + 8 }]}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHeaderText}>
              <Text style={styles.sheetTitle}>Chaveamento</Text>
              <Text style={styles.sheetSubtitle}>
                Chave de {bracketSize} • sobe até o campeão
              </Text>
            </View>
            <View style={styles.zoomControls}>
              <Pressable
                onPress={zoomOut}
                disabled={zoom <= ZOOM_MIN}
                hitSlop={8}
                style={[
                  styles.zoomBtn,
                  zoom <= ZOOM_MIN && styles.zoomBtnDisabled,
                ]}
                accessibilityLabel="Diminuir zoom"
              >
                <Ionicons name="remove" size={18} color={theme.colors.text} />
              </Pressable>
              <Pressable onPress={zoomFit} hitSlop={6} style={styles.zoomReset}>
                <Text style={styles.zoomPercent}>{Math.round(zoom * 100)}%</Text>
              </Pressable>
              <Pressable
                onPress={zoomIn}
                disabled={zoom >= ZOOM_MAX}
                hitSlop={8}
                style={[
                  styles.zoomBtn,
                  zoom >= ZOOM_MAX && styles.zoomBtnDisabled,
                ]}
                accessibilityLabel="Aumentar zoom"
              >
                <Ionicons name="add" size={18} color={theme.colors.text} />
              </Pressable>
            </View>
            <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={theme.colors.text} />
            </Pressable>
          </View>

          {games.length === 0 ? (
            <Text style={styles.empty}>Nenhuma partida no chaveamento.</Text>
          ) : (
            <ScrollView
              style={styles.scroll}
              showsVerticalScrollIndicator
              contentContainerStyle={[
                styles.treeContent,
                { paddingBottom: insets.bottom + 24 },
              ]}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator
                contentContainerStyle={[
                  styles.treeHorizontal,
                  { minWidth: contentWidth },
                ]}
              >
                <View style={[styles.treeColumn, { width: contentWidth }]}>
                  {/* Campeão separado no topo — só troféu */}
                  <ChampionPedestal slot={finalSlot} zoom={zoom} />

                  <View style={styles.upStem} />
                  <RoundLabel label="FINAL" width={contentWidth - 24} />
                  <View style={styles.upStem} />
                  <FinalMatch slot={finalSlot} zoom={zoom} />

                  {/* Demais fases: sobe da 1ª rodada (embaixo) até a final */}
                  {roundsFromTop.map((row) => {
                    const width = rowWidth(row.slots.length, zoom);
                    return (
                      <View key={row.round} style={styles.roundBlock}>
                        <View style={styles.upStem} />
                        <RoundLabel label={row.label} width={contentWidth - 24} />
                        <View style={styles.upStem} />
                        <MatchesRow
                          slots={row.slots}
                          zoom={zoom}
                          width={width}
                        />
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  sheet: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: '#140F12',
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sheetHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  sheetTitle: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: theme.fontWeights.extraBold,
  },
  sheetSubtitle: {
    color: theme.colors.textDim,
    fontSize: 11,
    marginTop: 2,
    fontWeight: theme.fontWeights.semibold,
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  zoomBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceHigh,
  },
  zoomBtnDisabled: {
    opacity: 0.35,
  },
  zoomReset: {
    minWidth: 44,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  zoomPercent: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: theme.fontWeights.bold,
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
    paddingHorizontal: 24,
  },
  scroll: {
    flex: 1,
  },
  treeContent: {
    paddingTop: 20,
    flexGrow: 1,
  },
  treeHorizontal: {
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  treeColumn: {
    alignItems: 'center',
    gap: 2,
  },
  roundBlock: {
    alignItems: 'center',
    width: '100%',
  },
  matchesRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingVertical: 10,
  },
  matchNode: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  teamNode: {
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  shieldWrap: {
    position: 'relative',
  },
  winnerDot: {
    position: 'absolute',
    right: -3,
    top: -3,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
    borderWidth: 2,
    borderColor: '#140F12',
  },
  teamSigla: {
    color: theme.colors.textMuted,
    fontWeight: theme.fontWeights.bold,
    textAlign: 'center',
  },
  matchConnector: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  connectorLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#E8E8EE',
  },
  connectorDiamond: {
    width: 7,
    height: 7,
    backgroundColor: '#E8E8EE',
    transform: [{ rotate: '45deg' }],
  },
  upStem: {
    width: 1.5,
    height: 16,
    backgroundColor: '#E8E8EE',
  },
  roundLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'center',
    paddingVertical: 4,
  },
  roundLabelLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.borderStrong,
  },
  roundLabelText: {
    color: theme.colors.textDim,
    fontSize: 11,
    fontWeight: theme.fontWeights.extraBold,
    letterSpacing: 1.2,
  },
  finalMatch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  vsText: {
    color: theme.colors.textMuted,
    fontWeight: theme.fontWeights.bold,
  },
  championPedestal: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 8,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    minWidth: 160,
  },
  championPedestalLabel: {
    color: theme.colors.primarySoft,
    fontSize: 11,
    fontWeight: theme.fontWeights.extraBold,
    letterSpacing: 1.4,
  },
  trophyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1518',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  championShieldFrame: {
    padding: 6,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  championName: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: theme.fontWeights.extraBold,
    maxWidth: 180,
    textAlign: 'center',
  },
  awaiting: {
    color: theme.colors.textDim,
    fontSize: 12,
    textAlign: 'center',
  },
});
