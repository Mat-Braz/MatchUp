import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';

import { theme } from '@/constants/theme';
import type { MatchEvent, MatchTeamSquad } from '@/features/championships/api/tournament';
import { parseSubstitutionPlayerOut } from '@/features/championships/api/tournament';
import {
  formationsForSquadSize,
  getFormation,
  parseLineupAssignments,
  type SquadSize,
} from '@/features/teams';

type SubstitutionModalProps = {
  visible: boolean;
  onClose: () => void;
  teamName: string;
  squad: MatchTeamSquad | null;
  squadSize: number | null;
  formation: string | null;
  lineup: string | null;
  substitutionEvents: MatchEvent[];
  acting: boolean;
  onConfirm: (playerOutId: number, playerInId: number) => void;
};

function buildCurrentAssignments(
  lineup: string | null,
  substitutionEvents: MatchEvent[],
): Record<string, number> {
  const assignments = { ...parseLineupAssignments(lineup) };

  for (const event of substitutionEvents) {
    const playerOut = parseSubstitutionPlayerOut(event.note);
    const playerIn = event.userId;
    if (playerOut == null || playerIn == null) {
      continue;
    }

    const slotId = Object.keys(assignments).find(
      (key) => assignments[key] === playerOut,
    );
    if (slotId) {
      assignments[slotId] = playerIn;
    }
  }

  return assignments;
}

export function SubstitutionModal({
  visible,
  onClose,
  teamName,
  squad,
  squadSize,
  formation,
  lineup,
  substitutionEvents,
  acting,
  onConfirm,
}: SubstitutionModalProps) {
  const insets = useSafeAreaInsets();
  const [playerOutId, setPlayerOutId] = useState<number | null>(null);
  const [playerInId, setPlayerInId] = useState<number | null>(null);

  const formationDef = useMemo(() => {
    if (squadSize !== 5 && squadSize !== 11) {
      return null;
    }
    const size = squadSize as SquadSize;
    const options = formationsForSquadSize(size);
    const formationId =
      formation && options.some((item) => item.id === formation)
        ? formation
        : options[0].id;
    return getFormation(size, formationId);
  }, [formation, squadSize]);

  const assignments = useMemo(
    () => buildCurrentAssignments(lineup, substitutionEvents),
    [lineup, substitutionEvents],
  );

  const activeNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const player of squad?.activePlayers ?? []) {
      map.set(player.playerId, player.playerName);
    }
    return map;
  }, [squad]);

  const canConfirm =
    playerOutId != null &&
    playerInId != null &&
    playerOutId !== playerInId &&
    (squad?.substitutionsLimit == null ||
      (squad?.substitutionsUsed ?? 0) < (squad?.substitutionsLimit ?? 0));

  function handleClose() {
    setPlayerOutId(null);
    setPlayerInId(null);
    onClose();
  }

  function handleConfirm() {
    if (!canConfirm || playerOutId == null || playerInId == null) {
      return;
    }
    onConfirm(playerOutId, playerInId);
    setPlayerOutId(null);
    setPlayerInId(null);
  }

  const showPitch = formationDef != null && Object.keys(assignments).length > 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={handleClose} />
        <View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <View style={styles.sheetHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sheetTitle}>Substituição</Text>
              <Text style={styles.sheetSubtitle}>{teamName}</Text>
            </View>
            <Pressable onPress={handleClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </Pressable>
          </View>

          {squad?.substitutionsLimit != null ? (
            <Text style={styles.hint}>
              Substituídos: {squad.substitutionsUsed}/{squad.substitutionsLimit}
            </Text>
          ) : null}

          <Text style={styles.stepHint}>
            1. Toque em quem sai • 2. Toque em quem entra do banco
          </Text>

          <ScrollView
            contentContainerStyle={styles.scrollBody}
            showsVerticalScrollIndicator={false}
          >
            {showPitch ? (
              <View style={styles.pitch}>
                <View style={styles.pitchInner}>
                  <View style={styles.centerCircle} />
                  <View style={styles.halfway} />
                  {formationDef.slots.map((slot) => {
                    const assignedId = assignments[slot.id];
                    const isActive =
                      assignedId != null && activeNameById.has(assignedId);
                    if (!isActive || assignedId == null) {
                      return null;
                    }

                    const name = activeNameById.get(assignedId);
                    const selected = playerOutId === assignedId;

                    return (
                      <Pressable
                        key={slot.id}
                        onPress={() => {
                          setPlayerOutId(assignedId);
                          if (playerInId === assignedId) {
                            setPlayerInId(null);
                          }
                        }}
                        style={[
                          styles.slot,
                          { left: `${slot.x}%`, top: `${slot.y}%` },
                          selected && styles.slotSelected,
                        ]}
                      >
                        <Text style={styles.slotLabel}>{slot.label}</Text>
                        <Text style={styles.slotName} numberOfLines={1}>
                          {name?.split(' ')[0] ?? '—'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : (
              <View style={styles.fallbackBlock}>
                <Text style={styles.blockTitle}>Em campo</Text>
                <View style={styles.chipRow}>
                  {(squad?.activePlayers ?? []).map((player) => (
                    <Pressable
                      key={player.playerId}
                      style={[
                        styles.chip,
                        playerOutId === player.playerId && styles.chipSelected,
                      ]}
                      onPress={() => setPlayerOutId(player.playerId)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          playerOutId === player.playerId && styles.chipTextSelected,
                        ]}
                      >
                        {player.playerName}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            <Text style={styles.benchTitle}>Banco</Text>
            <Text style={styles.benchHint}>Escolha quem entra em campo</Text>
            <View style={styles.benchRow}>
              {(squad?.benchPlayers ?? []).length === 0 ? (
                <Text style={styles.emptyBench}>Nenhum jogador no banco.</Text>
              ) : (
                (squad?.benchPlayers ?? []).map((player) => (
                  <Pressable
                    key={player.playerId}
                    style={[
                      styles.benchChip,
                      playerInId === player.playerId && styles.benchChipSelected,
                    ]}
                    onPress={() => setPlayerInId(player.playerId)}
                  >
                    <Text
                      style={[
                        styles.benchChipText,
                        playerInId === player.playerId && styles.benchChipTextSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {player.playerName.split(' ')[0]}
                    </Text>
                  </Pressable>
                ))
              )}
            </View>

            {playerOutId != null && playerInId != null ? (
              <Text style={styles.preview}>
                {activeNameById.get(playerOutId) ?? 'Jogador'} →{' '}
                {squad?.benchPlayers.find((p) => p.playerId === playerInId)?.playerName ??
                  'Reserva'}
              </Text>
            ) : null}
          </ScrollView>

          <Pressable
            style={[styles.confirmBtn, (!canConfirm || acting) && styles.confirmBtnDisabled]}
            disabled={!canConfirm || acting}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmBtnText}>
              {acting ? 'Substituindo...' : 'Confirmar substituição'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    maxHeight: '92%',
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 10,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  sheetTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: theme.fontWeights.bold,
  },
  sheetSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  hint: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  stepHint: {
    color: theme.colors.primarySoft,
    fontSize: 13,
    fontWeight: theme.fontWeights.semibold,
  },
  scrollBody: {
    gap: 12,
    paddingBottom: 8,
  },
  pitch: {
    height: 340,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: '#0B3D1E',
  },
  pitchInner: {
    flex: 1,
    margin: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 8,
    position: 'relative',
  },
  halfway: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  centerCircle: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    left: '50%',
    top: '50%',
    marginLeft: -35,
    marginTop: -35,
  },
  slot: {
    position: 'absolute',
    width: 56,
    height: 56,
    marginLeft: -28,
    marginTop: -28,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  slotSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(0,40,0,0.85)',
  },
  slotLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    fontWeight: theme.fontWeights.bold,
  },
  slotName: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: theme.fontWeights.bold,
  },
  fallbackBlock: { gap: 8 },
  blockTitle: {
    color: theme.colors.text,
    fontWeight: theme.fontWeights.bold,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: theme.fontWeights.bold,
  },
  chipTextSelected: {
    color: theme.colors.black,
  },
  benchTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: theme.fontWeights.bold,
    marginTop: 4,
  },
  benchHint: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  benchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  benchChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    maxWidth: '48%',
  },
  benchChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    borderStyle: 'solid',
  },
  benchChipText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: theme.fontWeights.semibold,
  },
  benchChipTextSelected: {
    color: theme.colors.black,
  },
  emptyBench: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  preview: {
    color: theme.colors.primarySoft,
    textAlign: 'center',
    fontWeight: theme.fontWeights.bold,
    fontSize: 14,
  },
  confirmBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDisabled: {
    opacity: 0.45,
  },
  confirmBtnText: {
    color: theme.colors.black,
    fontWeight: theme.fontWeights.extraBold,
  },
});
