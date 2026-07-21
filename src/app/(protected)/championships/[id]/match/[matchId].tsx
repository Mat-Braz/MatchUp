import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';

import { championshipRoutes } from '@/constants/championshipRoutes';
import { theme } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import {
  eventTypeLabel,
  fetchMatchDetail,
  matchStatusLabel,
  startMatch,
  startPenalties,
  submitMatchResult,
  confirmMatchResult,
  rejectMatchResult,
  addMatchEvent,
  removeMatchEvent,
  type MatchDetail,
} from '@/features/championships';
import { fetchTeamMembers, type TeamMember } from '@/features/teams';
import { fetchMe } from '@/features/profile';
import { ApiError } from '@/lib/api/graphql';

const REGULAR_EVENTS = [
  { type: 'GOL', label: 'Gol' },
  { type: 'CARTAO_AMARELO', label: 'Amarelo' },
  { type: 'CARTAO_VERMELHO', label: 'Vermelho' },
  { type: 'FALTA', label: 'Falta' },
] as const;

const PENALTY_EVENTS = [
  { type: 'PENALTI_GOL', label: 'Convertido' },
  { type: 'PENALTI_PERDIDO', label: 'Perdido' },
] as const;

const MATCH_POLL_MS = 4000;

export default function MatchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const params = useLocalSearchParams<{ id?: string; matchId?: string }>();
  const championshipId = Number(params.id);
  const matchId = Number(params.matchId);

  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [homeMembers, setHomeMembers] = useState<TeamMember[]>([]);
  const [awayMembers, setAwayMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

  const isOrganizer =
    match != null && userId != null && match.championship.responsibleUserId === userId;

  const isHomeCreator =
    match?.game.homeTeam != null &&
    userId != null &&
    match.game.homeTeam.createdByUserId === userId;
  const isAwayCreator =
    match?.game.awayTeam != null &&
    userId != null &&
    match.game.awayTeam.createdByUserId === userId;
  const canConfirm =
    (isHomeCreator || isAwayCreator) &&
    match?.status === 'AGUARDANDO_CONFIRMACAO';

  const canEditEvents =
    isOrganizer &&
    (match?.status === 'EM_ANDAMENTO' || match?.status === 'REVISAO');

  const membersForSelected = useMemo(() => {
    if (!match || selectedTeamId == null) {
      return [];
    }
    if (selectedTeamId === match.game.homeTeam?.id) {
      return homeMembers;
    }
    if (selectedTeamId === match.game.awayTeam?.id) {
      return awayMembers;
    }
    return [];
  }, [awayMembers, homeMembers, match, selectedTeamId]);

  const load = useCallback(async (options?: { silent?: boolean }) => {
    if (!token || !Number.isFinite(matchId)) {
      setLoading(false);
      return;
    }
    const silent = options?.silent === true;
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      if (silent) {
        const detail = await fetchMatchDetail(token, matchId);
        setMatch(detail);
        return;
      }

      const [detail, me] = await Promise.all([
        fetchMatchDetail(token, matchId),
        fetchMe(token),
      ]);
      setMatch(detail);
      setUserId(me.id);
      setSelectedTeamId((current) => current ?? detail.game.homeTeam?.id ?? null);

      const [home, away] = await Promise.all([
        detail.game.homeTeam
          ? fetchTeamMembers(token, detail.game.homeTeam.id)
          : Promise.resolve([]),
        detail.game.awayTeam
          ? fetchTeamMembers(token, detail.game.awayTeam.id)
          : Promise.resolve([]),
      ]);
      setHomeMembers(home);
      setAwayMembers(away);
      setError(null);
    } catch (err) {
      if (!silent) {
        setError(err instanceof ApiError ? err.message : 'Falha ao carregar partida.');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [matchId, token]);

  const isOrganizerRef = useRef(isOrganizer);
  isOrganizerRef.current = isOrganizer;

  useFocusEffect(
    useCallback(() => {
      void load();

      const intervalId = setInterval(() => {
        if (isOrganizerRef.current) {
          return;
        }
        void load({ silent: true });
      }, MATCH_POLL_MS);

      return () => clearInterval(intervalId);
    }, [load]),
  );

  async function runAction(action: () => Promise<void>) {
    if (!token || acting) {
      return;
    }
    setActing(true);
    setError(null);
    try {
      await action();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível concluir.');
    } finally {
      setActing(false);
    }
  }

  async function handleAddEvent(eventType: string) {
    if (!token || !match || selectedTeamId == null) {
      return;
    }
    const needsPlayer =
      eventType === 'GOL' ||
      eventType === 'PENALTI_GOL' ||
      eventType === 'PENALTI_PERDIDO' ||
      eventType === 'CARTAO_AMARELO' ||
      eventType === 'CARTAO_VERMELHO' ||
      eventType === 'FALTA';
    if (needsPlayer && selectedPlayerId == null) {
      setError('Selecione o jogador responsável.');
      return;
    }
    await runAction(async () => {
      await addMatchEvent(token, {
        matchId: match.id,
        teamId: selectedTeamId,
        userId: needsPlayer ? selectedPlayerId : null,
        eventType,
      });
    });
  }

  const scoreText = match
    ? match.phase === 'PENALTIS'
      ? `${match.homeScore ?? 0} x ${match.awayScore ?? 0}  (pên. ${match.penaltyHomeScore ?? 0} x ${match.penaltyAwayScore ?? 0})`
      : `${match.homeScore ?? 0} x ${match.awayScore ?? 0}`
    : '';

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>
            {match?.championship.name ?? 'Partida'}
          </Text>
          <Text style={styles.subtitle}>
            {match
              ? `Rodada ${match.game.round} • ${matchStatusLabel(match.status)}`
              : 'Carregando...'}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingBottom: Math.max(insets.bottom, 28) },
        ]}
      >
        {loading ? <ActivityIndicator color={theme.colors.primary} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {match && !loading ? (
          <>
            <View style={styles.scoreCard}>
              <Text style={styles.teamName} numberOfLines={1}>
                {match.game.homeTeam?.name ?? '—'}
              </Text>
              <Text style={styles.score}>{scoreText}</Text>
              <Text style={styles.teamName} numberOfLines={1}>
                {match.game.awayTeam?.name ?? '—'}
              </Text>
            </View>

            {isOrganizer && match.status === 'AGENDADA' ? (
              <Pressable
                style={styles.primaryBtn}
                disabled={acting}
                onPress={() =>
                  void runAction(async () => {
                    await startMatch(token!, match.id);
                  })
                }
              >
                <Text style={styles.primaryBtnText}>Iniciar partida</Text>
              </Pressable>
            ) : null}

            {canEditEvents ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Registrar evento</Text>
                <View style={styles.row}>
                  {[match.game.homeTeam, match.game.awayTeam].map((team) =>
                    team ? (
                      <Pressable
                        key={team.id}
                        style={[
                          styles.chip,
                          selectedTeamId === team.id && styles.chipActive,
                        ]}
                        onPress={() => {
                          setSelectedTeamId(team.id);
                          setSelectedPlayerId(null);
                        }}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            selectedTeamId === team.id && styles.chipTextActive,
                          ]}
                        >
                          {team.sigla ?? team.name}
                        </Text>
                      </Pressable>
                    ) : null,
                  )}
                </View>

                <Text style={styles.hint}>Jogador (obrigatório para gols, cartões e faltas)</Text>
                <View style={styles.rowWrap}>
                  {membersForSelected.map((member) => (
                    <Pressable
                      key={member.playerId}
                      style={[
                        styles.chip,
                        selectedPlayerId === member.playerId && styles.chipActive,
                      ]}
                      onPress={() => setSelectedPlayerId(member.playerId)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selectedPlayerId === member.playerId && styles.chipTextActive,
                        ]}
                      >
                        {member.playerName}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <View style={styles.rowWrap}>
                  {(match.phase === 'PENALTIS' ? PENALTY_EVENTS : REGULAR_EVENTS).map(
                    (item) => (
                      <Pressable
                        key={item.type}
                        style={styles.eventBtn}
                        disabled={acting}
                        onPress={() => void handleAddEvent(item.type)}
                      >
                        <Text style={styles.eventBtnText}>{item.label}</Text>
                      </Pressable>
                    ),
                  )}
                </View>

                {match.championship.championshipType === 'ELIMINATORIA' &&
                match.phase === 'REGULAR' &&
                (match.homeScore ?? 0) === (match.awayScore ?? 0) ? (
                  <Pressable
                    style={styles.secondaryBtn}
                    disabled={acting}
                    onPress={() =>
                      void runAction(async () => {
                        await startPenalties(token!, match.id);
                      })
                    }
                  >
                    <Text style={styles.secondaryBtnText}>Ir para pênaltis</Text>
                  </Pressable>
                ) : null}

                <Pressable
                  style={styles.primaryBtn}
                  disabled={acting}
                  onPress={() =>
                    void runAction(async () => {
                      await submitMatchResult(token!, match.id);
                    })
                  }
                >
                  <Text style={styles.primaryBtnText}>
                    {match.status === 'REVISAO'
                      ? 'Reenviar resultado'
                      : 'Enviar para confirmação'}
                  </Text>
                </Pressable>
              </View>
            ) : null}

            {canConfirm ? (
              <View style={styles.actions}>
                <Pressable
                  style={styles.primaryBtn}
                  disabled={acting}
                  onPress={() =>
                    void runAction(async () => {
                      await confirmMatchResult(token!, match.id);
                    })
                  }
                >
                  <Text style={styles.primaryBtnText}>Concordar</Text>
                </Pressable>
                <Pressable
                  style={styles.dangerBtn}
                  disabled={acting}
                  onPress={() =>
                    Alert.alert(
                      'Recusar resultado',
                      'O organizador deverá revisar e reenviar.',
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Recusar',
                          style: 'destructive',
                          onPress: () =>
                            void runAction(async () => {
                              await rejectMatchResult(token!, match.id);
                            }),
                        },
                      ],
                    )
                  }
                >
                  <Text style={styles.dangerBtnText}>Recusar</Text>
                </Pressable>
              </View>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Eventos</Text>
              {match.events.length === 0 ? (
                <Text style={styles.hint}>Nenhum evento registrado.</Text>
              ) : (
                match.events.map((event) => (
                  <View key={event.id} style={styles.eventRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.eventTitle}>
                        {eventTypeLabel(event.eventType)}
                        {event.user ? ` — ${event.user.name}` : ''}
                      </Text>
                      <Text style={styles.hint}>{event.team.name}</Text>
                    </View>
                    {canEditEvents ? (
                      <Pressable
                        onPress={() =>
                          void runAction(async () => {
                            await removeMatchEvent(token!, event.id);
                          })
                        }
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color={theme.colors.dangerSoft}
                        />
                      </Pressable>
                    ) : null}
                  </View>
                ))
              )}
            </View>

            {!Number.isFinite(championshipId) ? null : (
              <Pressable
                onPress={() =>
                  router.replace(championshipRoutes.detail(championshipId) as never)
                }
              >
                <Text style={styles.link}>Voltar ao chaveamento</Text>
              </Pressable>
            )}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  title: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: theme.fontWeights.bold,
  },
  subtitle: { color: theme.colors.textMuted, fontSize: 13, marginTop: 2 },
  body: { paddingHorizontal: 20, gap: 14 },
  scoreCard: {
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    gap: 8,
    alignItems: 'center',
  },
  teamName: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: theme.fontWeights.semibold,
  },
  score: {
    color: theme.colors.primary,
    fontSize: 28,
    fontWeight: theme.fontWeights.extraBold,
  },
  section: { gap: 10 },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: theme.fontWeights.bold,
  },
  hint: { color: theme.colors.textMuted, fontSize: 13 },
  row: { flexDirection: 'row', gap: 8 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: theme.fontWeights.bold,
  },
  chipTextActive: { color: theme.colors.black },
  eventBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: theme.colors.surfaceHigh,
  },
  eventBtnText: {
    color: theme.colors.text,
    fontWeight: theme.fontWeights.bold,
    fontSize: 12,
  },
  primaryBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  primaryBtnText: {
    color: theme.colors.black,
    fontWeight: theme.fontWeights.extraBold,
  },
  secondaryBtn: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: theme.colors.text,
    fontWeight: theme.fontWeights.bold,
  },
  actions: { flexDirection: 'row', gap: 10 },
  dangerBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceHigh,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerBtnText: {
    color: theme.colors.dangerSoft,
    fontWeight: theme.fontWeights.bold,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  eventTitle: {
    color: theme.colors.text,
    fontWeight: theme.fontWeights.semibold,
  },
  link: {
    color: theme.colors.primarySoft,
    textAlign: 'center',
    fontWeight: theme.fontWeights.semibold,
  },
  error: {
    color: theme.colors.dangerSoft,
    fontSize: 13,
    fontWeight: theme.fontWeights.semibold,
  },
});
