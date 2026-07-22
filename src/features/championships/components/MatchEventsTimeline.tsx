import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { theme } from '@/constants/theme';
import type { MatchEvent } from '@/features/championships/api/tournament';
import {
  eventTypeLabel,
  formatSubstitutionLabel,
  parseSubstitutionPlayerOut,
} from '@/features/championships/api/tournament';

type MatchEventsTimelineProps = {
  events: MatchEvent[];
  homeTeamId: number | null;
  awayTeamId: number | null;
  playerNameById: Map<number, string>;
  canDelete?: boolean;
  onDelete?: (eventId: number) => void;
};

function eventIcon(eventType: string): {
  name?: keyof typeof Ionicons.glyphMap;
  cardColor?: string;
} {
  switch (eventType) {
    case 'GOL':
    case 'PENALTI_GOL':
      return { name: 'football-outline' };
    case 'PENALTI_PERDIDO':
      return { name: 'close-circle-outline' };
    case 'CARTAO_AMARELO':
      return { cardColor: '#F5C518' };
    case 'CARTAO_VERMELHO':
      return { cardColor: '#E53935' };
    case 'FALTA':
      return { name: 'hand-left-outline' };
    case 'SUBSTITUICAO':
      return { name: 'swap-horizontal-outline' };
    default:
      return { name: 'ellipse-outline' };
  }
}

function buildEventText(
  event: MatchEvent,
  playerNameById: Map<number, string>,
): { title: string; detail: string } {
  if (event.eventType === 'SUBSTITUICAO') {
    const playerOutId = parseSubstitutionPlayerOut(event.note);
    const playerIn =
      event.user?.name ?? playerNameById.get(event.userId ?? -1) ?? '—';
    const playerOut =
      playerOutId != null ? playerNameById.get(playerOutId) ?? '—' : '—';
    return {
      title: eventTypeLabel(event.eventType),
      detail: formatSubstitutionLabel(playerIn, playerOut),
    };
  }

  return {
    title: eventTypeLabel(event.eventType),
    detail: event.user?.name ?? 'Sem jogador',
  };
}

export function MatchEventsTimeline({
  events,
  homeTeamId,
  awayTeamId,
  playerNameById,
  canDelete = false,
  onDelete,
}: MatchEventsTimelineProps) {
  if (events.length === 0) {
    return <Text style={styles.empty}>Nenhum evento registrado.</Text>;
  }

  return (
    <View style={styles.timeline}>
      <View style={styles.spine} />
      {events.map((event, index) => {
        const isHome = homeTeamId != null && event.teamId === homeTeamId;
        const isAway = awayTeamId != null && event.teamId === awayTeamId;
        const side: 'left' | 'right' = isAway && !isHome ? 'right' : 'left';
        const icon = eventIcon(event.eventType);
        const { title, detail } = buildEventText(event, playerNameById);
        const isLast = index === events.length - 1;

        return (
          <View
            key={event.id}
            style={[styles.row, isLast && styles.rowLast]}
          >
            {side === 'left' ? (
              <View style={[styles.side, styles.sideLeft]}>
                <View style={[styles.flag, styles.flagLeft]}>
                  <View style={styles.flagBody}>
                    <Text style={styles.flagTitle} numberOfLines={1}>
                      {title}
                    </Text>
                    <Text style={styles.flagDetail} numberOfLines={2}>
                      {detail}
                    </Text>
                  </View>
                  {canDelete && onDelete ? (
                    <Pressable
                      hitSlop={8}
                      onPress={() => onDelete(event.id)}
                      style={styles.deleteBtn}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={14}
                        color={theme.colors.dangerSoft}
                      />
                    </Pressable>
                  ) : null}
                </View>
                <View style={styles.arrowRight} />
              </View>
            ) : (
              <View style={styles.side} />
            )}

            <View style={styles.nodeWrap}>
              <View style={styles.node}>
                {icon.cardColor ? (
                  <View
                    style={[
                      styles.cardGlyph,
                      {
                        backgroundColor: icon.cardColor,
                        borderColor: icon.cardColor,
                      },
                    ]}
                  />
                ) : (
                  <Ionicons
                    name={icon.name ?? 'ellipse-outline'}
                    size={16}
                    color={theme.colors.primary}
                  />
                )}
              </View>
            </View>

            {side === 'right' ? (
              <View style={[styles.side, styles.sideRight]}>
                <View style={styles.arrowLeft} />
                <View style={[styles.flag, styles.flagRight]}>
                  <View style={styles.flagBody}>
                    <Text style={styles.flagTitle} numberOfLines={1}>
                      {title}
                    </Text>
                    <Text style={styles.flagDetail} numberOfLines={2}>
                      {detail}
                    </Text>
                  </View>
                  {canDelete && onDelete ? (
                    <Pressable
                      hitSlop={8}
                      onPress={() => onDelete(event.id)}
                      style={styles.deleteBtn}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={14}
                        color={theme.colors.dangerSoft}
                      />
                    </Pressable>
                  ) : null}
                </View>
              </View>
            ) : (
              <View style={styles.side} />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  timeline: {
    position: 'relative',
    paddingVertical: 4,
  },
  spine: {
    position: 'absolute',
    left: '50%',
    marginLeft: -1,
    top: 12,
    bottom: 12,
    width: 2,
    backgroundColor: '#3A3A42',
    opacity: 0.9,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 72,
    marginBottom: 10,
  },
  rowLast: {
    marginBottom: 0,
  },
  side: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideLeft: {
    justifyContent: 'flex-end',
    paddingRight: 0,
  },
  sideRight: {
    justifyContent: 'flex-start',
    paddingLeft: 0,
  },
  nodeWrap: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  node: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#12131A',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  cardGlyph: {
    width: 10,
    height: 14,
    borderRadius: 2,
    borderWidth: 1,
    transform: [{ rotate: '12deg' }],
  },
  arrowRight: {
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: theme.colors.surfaceCard,
    marginLeft: -1,
  },
  arrowLeft: {
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderRightWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: theme.colors.surfaceCard,
    marginRight: -1,
  },
  flag: {
    width: 148,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  flagLeft: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  flagRight: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
  },
  flagBody: {
    flex: 1,
    gap: 2,
    justifyContent: 'center',
  },
  flagTitle: {
    color: theme.colors.primarySoft,
    fontSize: 11,
    fontWeight: theme.fontWeights.extraBold,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  flagDetail: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: theme.fontWeights.semibold,
    lineHeight: 16,
  },
  deleteBtn: {
    padding: 4,
  },
});
