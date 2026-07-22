import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';

import { championshipRoutes } from '@/constants/championshipRoutes';
import { theme } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import {
  BracketTreeModal,
  championshipStatusLabel,
  fetchChampionship,
  fetchChampionshipBracket,
  fetchChampionshipStandings,
  fetchChampionshipTeams,
  formatChampionshipDates,
  inviteTeamToChampionship,
  matchStatusLabel,
  removeChampionship,
  requestJoinChampionship,
  resolveChampionshipChampion,
  searchTeams,
  startChampionship,
  teamsCountLabel,
  fetchPendingChampionshipInviteTeamIds,
  fetchPendingChampionshipJoinTeamIds,
  type BracketGame,
  type ChampionshipDetails,
  type ChampionshipTeamItem,
  type StandingRow,
  type TeamSearchItem,
} from '@/features/championships';
import { fetchMe } from '@/features/profile';
import { fetchMyTeams, type MyTeamItem } from '@/features/teams';
import { ApiError } from '@/lib/api/graphql';

export default function ChampionshipDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const params = useLocalSearchParams<{ id?: string }>();
  const championshipId = Number(params.id);

  const [championship, setChampionship] = useState<ChampionshipDetails | null>(null);
  const [teams, setTeams] = useState<ChampionshipTeamItem[]>([]);
  const [myTeams, setMyTeams] = useState<MyTeamItem[]>([]);
  const [bracket, setBracket] = useState<BracketGame[]>([]);
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [acting, setActing] = useState(false);

  const [inviteQuery, setInviteQuery] = useState('');
  const [inviteResults, setInviteResults] = useState<TeamSearchItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [pendingJoinTeamIds, setPendingJoinTeamIds] = useState<number[]>([]);
  const [pendingInviteTeamIds, setPendingInviteTeamIds] = useState<number[]>([]);
  const [bracketModalVisible, setBracketModalVisible] = useState(false);

  const isOrganizer = useMemo(
    () =>
      championship != null &&
      userId != null &&
      championship.responsibleUserId === userId,
    [championship, userId],
  );

  const enrollmentOpen = championship?.status === 'INSCRICOES_ABERTAS';
  const isRunning =
    championship?.status === 'EM_ANDAMENTO' || championship?.status === 'ENCERRADO';
  const supportsTournament =
    championship?.championshipType === 'ELIMINATORIA' ||
    championship?.championshipType === 'PONTOS_CORRIDOS';

  const creatableTeams = useMemo(
    () => myTeams.filter((team) => team.isCreator),
    [myTeams],
  );

  const enrolledTeamIds = useMemo(
    () => new Set(teams.map((team) => team.id)),
    [teams],
  );

  const gamesByRound = useMemo(() => {
    const map = new Map<number, BracketGame[]>();
    for (const game of bracket) {
      const list = map.get(game.round) ?? [];
      list.push(game);
      map.set(game.round, list);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [bracket]);

  const load = useCallback(async () => {
    if (!token || !Number.isFinite(championshipId)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [detail, linked, me, owned] = await Promise.all([
        fetchChampionship(token, championshipId),
        fetchChampionshipTeams(token, championshipId),
        fetchMe(token),
        fetchMyTeams(token),
      ]);
      setChampionship(detail);
      setTeams(linked);
      setUserId(me.id);
      setMyTeams(owned);

      const [pendingJoin, pendingInvite] = await Promise.all([
        fetchPendingChampionshipJoinTeamIds(token, championshipId),
        fetchPendingChampionshipInviteTeamIds(token, championshipId),
      ]);
      setPendingJoinTeamIds(pendingJoin);
      setPendingInviteTeamIds(pendingInvite);

      if (
        detail.status === 'EM_ANDAMENTO' ||
        detail.status === 'ENCERRADO'
      ) {
        const [games, table] = await Promise.all([
          fetchChampionshipBracket(token, championshipId),
          fetchChampionshipStandings(token, championshipId),
        ]);
        setBracket(games);
        setStandings(table);
      } else {
        setBracket([]);
        setStandings([]);
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível carregar o campeonato.',
      );
    } finally {
      setLoading(false);
    }
  }, [championshipId, token]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function handleSearchTeams() {
    if (!token || inviteQuery.trim().length < 2) {
      setInviteResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await searchTeams(token, inviteQuery);
      setInviteResults(
        results.filter((team) => !enrolledTeamIds.has(team.id)),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha na busca de times.');
    } finally {
      setSearching(false);
    }
  }

  async function handleInvite(teamId: number) {
    if (!token || acting || pendingInviteTeamIds.includes(teamId)) {
      return;
    }
    setActing(true);
    setMessage(null);
    setError(null);
    try {
      await inviteTeamToChampionship(token, championshipId, teamId);
      setPendingInviteTeamIds((current) =>
        current.includes(teamId) ? current : [...current, teamId],
      );
      setMessage('Convite enviado para o criador do time.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao convidar time.');
    } finally {
      setActing(false);
    }
  }

  async function handleRequestJoin(teamId: number) {
    if (!token || acting || pendingJoinTeamIds.includes(teamId)) {
      return;
    }
    setActing(true);
    setMessage(null);
    setError(null);
    try {
      await requestJoinChampionship(token, championshipId, teamId);
      setPendingJoinTeamIds((current) =>
        current.includes(teamId) ? current : [...current, teamId],
      );
      setMessage('Solicitação enviada ao organizador.');
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Falha ao solicitar inscrição.',
      );
    } finally {
      setActing(false);
    }
  }

  function confirmDelete() {
    if (!token || !championship) {
      return;
    }
    Alert.alert(
      'Apagar campeonato',
      `Tem certeza que deseja apagar "${championship.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              setActing(true);
              try {
                await removeChampionship(token, championship.id);
                router.replace('/(protected)/(tabs)/home' as never);
              } catch (err) {
                setError(
                  err instanceof ApiError
                    ? err.message
                    : 'Não foi possível apagar.',
                );
              } finally {
                setActing(false);
              }
            })();
          },
        },
      ],
    );
  }

  function confirmStart() {
    if (!token || !championship) {
      return;
    }
    Alert.alert(
      'Iniciar campeonato',
      'Isso fecha as inscrições e gera o chaveamento. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Iniciar',
          onPress: () => {
            void (async () => {
              setActing(true);
              setError(null);
              setMessage(null);
              try {
                await startChampionship(token, championship.id);
                setMessage('Campeonato iniciado.');
                await load();
              } catch (err) {
                setError(
                  err instanceof ApiError
                    ? err.message
                    : 'Não foi possível iniciar.',
                );
              } finally {
                setActing(false);
              }
            })();
          },
        },
      ],
    );
  }

  const canRequestJoin =
    championship?.isPublic &&
    enrollmentOpen &&
    !isOrganizer &&
    creatableTeams.some((team) => !enrolledTeamIds.has(team.teamId));

  const canStart =
    isOrganizer &&
    enrollmentOpen &&
    supportsTournament &&
    teams.length >= 2;

  const champion = useMemo(() => {
    if (championship?.status !== 'ENCERRADO') {
      return null;
    }
    return resolveChampionshipChampion(
      championship.championshipType,
      standings,
      bracket,
    );
  }, [bracket, championship, standings]);

  const championTeam = useMemo(() => {
    if (!champion) {
      return null;
    }
    return teams.find((team) => team.id === champion.teamId) ?? null;
  }, [champion, teams]);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>
            {championship?.name ?? 'Campeonato'}
          </Text>
          <Text style={styles.subtitle}>
            {championship
              ? `${championship.isPublic ? 'Público' : 'Privado'} • ${championshipStatusLabel(championship.status)}`
              : 'Carregando...'}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingBottom: Math.max(insets.bottom, 24) },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {loading ? <ActivityIndicator color={theme.colors.primary} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {message ? <Text style={styles.ok}>{message}</Text> : null}

        {championship && !loading ? (
          <>
            <View style={styles.card}>
              <InfoRow
                label="Local"
                value={
                  championship.city && championship.uf
                    ? `${championship.city}/${championship.uf}`
                    : '—'
                }
              />
              <InfoRow
                label="Datas"
                value={formatChampionshipDates(
                  championship.startsAt,
                  championship.endsAt,
                )}
              />
              <InfoRow
                label="Times"
                value={teamsCountLabel(championship.teamsCount)}
              />
              {championship.description ? (
                <InfoRow label="Descrição" value={championship.description} />
              ) : null}
            </View>

            {isOrganizer && enrollmentOpen ? (
              <View style={styles.actions}>
                <Pressable
                  style={styles.primaryBtn}
                  onPress={() =>
                    router.push(championshipRoutes.edit(championship.id) as never)
                  }
                >
                  <Text style={styles.primaryBtnText}>Editar</Text>
                </Pressable>
                <Pressable style={styles.dangerBtn} onPress={confirmDelete}>
                  <Text style={styles.dangerBtnText}>Apagar</Text>
                </Pressable>
              </View>
            ) : null}

            {canStart ? (
              <Pressable
                style={styles.primaryBtn}
                disabled={acting}
                onPress={confirmStart}
              >
                <Text style={styles.primaryBtnText}>Iniciar campeonato</Text>
              </Pressable>
            ) : null}

            {isOrganizer && enrollmentOpen ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Convidar time</Text>
                <Text style={styles.sectionHint}>
                  O criador do time recebe o convite e pode aceitar ou recusar.
                </Text>
                <View style={styles.searchRow}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Buscar time por nome"
                    placeholderTextColor={theme.colors.textDim}
                    value={inviteQuery}
                    onChangeText={setInviteQuery}
                    onSubmitEditing={handleSearchTeams}
                    returnKeyType="search"
                  />
                  <Pressable style={styles.searchBtn} onPress={handleSearchTeams}>
                    {searching ? (
                      <ActivityIndicator color={theme.colors.black} />
                    ) : (
                      <Ionicons name="search" size={20} color={theme.colors.black} />
                    )}
                  </Pressable>
                </View>
                {inviteResults.map((team) => {
                  const pending = pendingInviteTeamIds.includes(team.id);
                  return (
                  <View key={team.id} style={styles.listRow}>
                    <View style={styles.avatar}>
                      {team.shieldUrl ? (
                        <Image source={{ uri: team.shieldUrl }} style={styles.avatarImage} />
                      ) : (
                        <Text style={styles.avatarText}>
                          {(team.sigla ?? team.name).slice(0, 1).toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.listName}>{team.name}</Text>
                    <Pressable
                      disabled={acting || pending}
                      onPress={() => void handleInvite(team.id)}
                      style={[styles.smallPrimary, pending && styles.smallPrimaryDone]}
                    >
                      <Text
                        style={[
                          styles.smallPrimaryText,
                          pending && styles.smallPrimaryTextDone,
                        ]}
                      >
                        {pending ? 'Convite enviado' : 'Convidar'}
                      </Text>
                    </Pressable>
                  </View>
                  );
                })}
              </View>
            ) : null}

            {canRequestJoin ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Solicitar inscrição</Text>
                <Text style={styles.sectionHint}>
                  Campeonato público: envie a solicitação com um time seu. O
                  organizador aprova ou recusa.
                </Text>
                {creatableTeams
                  .filter((team) => !enrolledTeamIds.has(team.teamId))
                  .map((team) => {
                    const pending = pendingJoinTeamIds.includes(team.teamId);
                    return (
                    <View key={team.id} style={styles.listRow}>
                      <Text style={styles.listName}>{team.teamName}</Text>
                      <Pressable
                        disabled={acting || pending}
                        onPress={() => void handleRequestJoin(team.teamId)}
                        style={[styles.smallPrimary, pending && styles.smallPrimaryDone]}
                      >
                        <Text
                          style={[
                            styles.smallPrimaryText,
                            pending && styles.smallPrimaryTextDone,
                          ]}
                        >
                          {pending ? 'Solicitação enviada' : 'Solicitar'}
                        </Text>
                      </Pressable>
                    </View>
                    );
                  })}
              </View>
            ) : null}

            {!championship.isPublic && !isOrganizer && enrollmentOpen ? (
              <Text style={styles.sectionHint}>
                Campeonato privado: apenas times convidados pelo organizador podem
                participar.
              </Text>
            ) : null}

            {isRunning ? (
              <>
                {standings.length > 0 &&
                championship.championshipType === 'PONTOS_CORRIDOS' ? (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Classificação</Text>
                    {standings.map((row, index) => (
                      <View key={row.id} style={styles.listRow}>
                        <Text style={styles.listMeta}>{index + 1}º</Text>
                        <Text style={styles.listName}>{row.team.name}</Text>
                        <Text style={styles.listMeta}>
                          {row.pointsScored} pts • {row.winsCount}V {row.drawsCount}E{' '}
                          {row.lossesCount}D
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                <View style={styles.section}>
                  <View style={styles.sectionTitleRow}>
                    <Text style={styles.sectionTitle}>
                      {championship.championshipType === 'ELIMINATORIA'
                        ? 'Chaveamento'
                        : 'Partidas'}
                    </Text>
                    {championship.championshipType === 'ELIMINATORIA' &&
                    bracket.length > 0 ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Ver chaveamento em árvore"
                        hitSlop={10}
                        onPress={() => setBracketModalVisible(true)}
                        style={styles.eyeBtn}
                      >
                        <Ionicons
                          name="eye-outline"
                          size={22}
                          color={theme.colors.primary}
                        />
                      </Pressable>
                    ) : null}
                  </View>
                  {gamesByRound.length === 0 ? (
                    <Text style={styles.sectionHint}>Nenhuma partida gerada.</Text>
                  ) : (
                    gamesByRound.map(([round, games]) => (
                      <View key={round} style={styles.roundBlock}>
                        <Text style={styles.roundTitle}>Rodada {round}</Text>
                        {games.map((game) => {
                          const match = game.matches?.[0];
                          const label = game.isBye
                            ? `${game.homeTeam?.name ?? '—'} (bye)`
                            : `${game.homeTeam?.name ?? '—'} x ${game.awayTeam?.name ?? '—'}`;
                          const score =
                            match && !game.isBye && match.homeScore != null
                              ? match.phase === 'PENALTIS'
                                ? `${match.homeScore}x${match.awayScore} (pên. ${match.penaltyHomeScore ?? 0}x${match.penaltyAwayScore ?? 0})`
                                : `${match.homeScore}x${match.awayScore}`
                              : null;
                          return (
                            <Pressable
                              key={game.id}
                              disabled={game.isBye || !match}
                              style={styles.matchRow}
                              onPress={() => {
                                if (!match) {
                                  return;
                                }
                                router.push(
                                  championshipRoutes.match(
                                    championship.id,
                                    match.id,
                                  ) as never,
                                );
                              }}
                            >
                              <View style={{ flex: 1 }}>
                                <Text style={styles.listName}>{label}</Text>
                                <Text style={styles.sectionHint}>
                                  {game.isBye
                                    ? 'Passa direto'
                                    : match
                                      ? matchStatusLabel(match.status)
                                      : '—'}
                                  {score ? ` • ${score}` : ''}
                                </Text>
                              </View>
                              {!game.isBye && match ? (
                                <Ionicons
                                  name="chevron-forward"
                                  size={18}
                                  color={theme.colors.textDim}
                                />
                              ) : null}
                            </Pressable>
                          );
                        })}
                      </View>
                    ))
                  )}
                </View>

                <BracketTreeModal
                  visible={bracketModalVisible}
                  games={bracket}
                  maxParticipants={championship.maxParticipants}
                  onClose={() => setBracketModalVisible(false)}
                />

                {champion ? (
                  <View style={styles.championSection}>
                    <Text style={styles.sectionTitle}>Campeão</Text>
                    <View style={styles.championCard}>
                      <View style={styles.championBadge}>
                        <Ionicons name="trophy" size={28} color={theme.colors.black} />
                      </View>
                      <View style={styles.championAvatar}>
                        {championTeam?.shieldUrl ? (
                          <Image
                            source={{ uri: championTeam.shieldUrl }}
                            style={styles.avatarImage}
                          />
                        ) : (
                          <Text style={styles.avatarText}>
                            {(champion.sigla ?? champion.name).slice(0, 1).toUpperCase()}
                          </Text>
                        )}
                      </View>
                      <View style={styles.championText}>
                        <Text style={styles.championLabel}>Campeão do campeonato</Text>
                        <Text style={styles.championName}>{champion.name}</Text>
                        {champion.sigla ? (
                          <Text style={styles.championSigla}>{champion.sigla}</Text>
                        ) : null}
                      </View>
                    </View>
                  </View>
                ) : championship.status === 'ENCERRADO' ? (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Campeão</Text>
                    <Text style={styles.sectionHint}>
                      Campeonato encerrado. Campeão ainda não identificado.
                    </Text>
                  </View>
                ) : null}
              </>
            ) : (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Times inscritos</Text>
                {teams.length === 0 ? (
                  <Text style={styles.sectionHint}>Nenhum time inscrito ainda.</Text>
                ) : (
                  teams.map((team) => (
                    <View key={team.id} style={styles.listRow}>
                      <Text style={styles.listName}>{team.name}</Text>
                      {team.sigla ? (
                        <Text style={styles.listMeta}>{team.sigla}</Text>
                      ) : null}
                    </View>
                  ))
                )}
              </View>
            )}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
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
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  body: {
    paddingHorizontal: 20,
    gap: 14,
  },
  card: {
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    gap: 10,
  },
  infoRow: { gap: 2 },
  infoLabel: {
    color: theme.colors.textDim,
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: theme.fontWeights.semibold,
  },
  infoValue: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: theme.fontWeights.semibold,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: theme.colors.black,
    fontWeight: theme.fontWeights.extraBold,
  },
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
  section: { gap: 10 },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: theme.fontWeights.bold,
  },
  eyeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionHint: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  input: {
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.colors.text,
    fontSize: 15,
  },
  searchBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: theme.colors.primarySoft,
    fontWeight: theme.fontWeights.bold,
  },
  listName: {
    flex: 1,
    color: theme.colors.text,
    fontWeight: theme.fontWeights.semibold,
  },
  listMeta: {
    color: theme.colors.textDim,
    fontSize: 12,
  },
  roundBlock: {
    gap: 6,
    marginBottom: 8,
  },
  roundTitle: {
    color: theme.colors.primarySoft,
    fontSize: 13,
    fontWeight: theme.fontWeights.bold,
    marginTop: 4,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  smallPrimary: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
  },
  smallPrimaryDone: {
    backgroundColor: theme.colors.surfaceHigh,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  smallPrimaryText: {
    color: theme.colors.black,
    fontWeight: theme.fontWeights.bold,
    fontSize: 12,
  },
  smallPrimaryTextDone: {
    color: theme.colors.textMuted,
  },
  ok: {
    color: theme.colors.primarySoft,
    fontSize: 13,
  },
  error: {
    color: theme.colors.dangerSoft,
    fontSize: 13,
    fontWeight: theme.fontWeights.semibold,
  },
  championSection: { gap: 10 },
  championCard: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  championBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  championAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  championText: {
    flex: 1,
    gap: 2,
    paddingRight: 36,
  },
  championLabel: {
    color: theme.colors.primarySoft,
    fontSize: 11,
    fontWeight: theme.fontWeights.bold,
    textTransform: 'uppercase',
  },
  championName: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: theme.fontWeights.extraBold,
  },
  championSigla: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: theme.fontWeights.semibold,
  },
});
