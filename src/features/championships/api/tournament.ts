import { graphqlRequest } from '@/lib/api/graphql';

export type MatchStatus =
  | 'AGENDADA'
  | 'EM_ANDAMENTO'
  | 'AGUARDANDO_CONFIRMACAO'
  | 'CONFIRMADA'
  | 'REVISAO';

export type MatchPhase = 'REGULAR' | 'PENALTIS';

export type BracketTeam = {
  id: number;
  name: string;
  sigla: string | null;
  shieldUrl?: string | null;
  createdByUserId: number;
};

export type BracketMatch = {
  id: number;
  status: MatchStatus;
  phase: MatchPhase;
  homeScore: number | null;
  awayScore: number | null;
  penaltyHomeScore: number | null;
  penaltyAwayScore: number | null;
};

export type BracketGame = {
  id: number;
  round: number;
  bracketPosition: number;
  isBye: boolean;
  homeTeamId: number | null;
  awayTeamId: number | null;
  winnerTeamId: number | null;
  homeTeam: BracketTeam | null;
  awayTeam: BracketTeam | null;
  winnerTeam: BracketTeam | null;
  matches: BracketMatch[];
};

export type StandingRow = {
  id: number;
  teamId: number;
  pointsScored: number;
  matchesCount: number;
  winsCount: number;
  drawsCount: number;
  lossesCount: number;
  goalsCount: number;
  championshipPosition: number | null;
  team: BracketTeam;
};

export type MatchEvent = {
  id: number;
  eventType: string;
  minute: number | null;
  note: string | null;
  teamId: number;
  userId: number | null;
  createdAt: string;
  user: { id: number; name: string } | null;
  team: { id: number; name: string };
};

export type MatchDetail = {
  id: number;
  championshipId: number;
  status: MatchStatus;
  phase: MatchPhase;
  homeScore: number | null;
  awayScore: number | null;
  penaltyHomeScore: number | null;
  penaltyAwayScore: number | null;
  homeConfirmedAt: string | null;
  awayConfirmedAt: string | null;
  homeRejectedAt: string | null;
  awayRejectedAt: string | null;
  championship: {
    id: number;
    name: string;
    championshipType: string;
    responsibleUserId: number;
    status: string;
  };
  game: {
    id: number;
    round: number;
    isBye: boolean;
    homeTeam: BracketTeam | null;
    awayTeam: BracketTeam | null;
    winnerTeam: BracketTeam | null;
  };
  events: MatchEvent[];
};

export type AddMatchEventInput = {
  matchId: number;
  teamId: number;
  userId?: number | null;
  relatedUserId?: number | null;
  eventType: string;
  minute?: number | null;
  note?: string | null;
};

export type MatchSquadPlayer = {
  playerId: number;
  playerName: string;
  yellowCards: number;
  isExpelled: boolean;
};

export type MatchTeamSquad = {
  teamId: number;
  activePlayers: MatchSquadPlayer[];
  benchPlayers: MatchSquadPlayer[];
  expelledPlayers: MatchSquadPlayer[];
  substitutionsUsed: number;
  substitutionsLimit: number | null;
};

const BRACKET_QUERY = `
  query ChampionshipBracket($championshipId: Int!) {
    championshipBracket(championshipId: $championshipId) {
      id
      round
      bracketPosition
      isBye
      homeTeamId
      awayTeamId
      winnerTeamId
      homeTeam { id name sigla shieldUrl createdByUserId }
      awayTeam { id name sigla shieldUrl createdByUserId }
      winnerTeam { id name sigla shieldUrl createdByUserId }
      matches {
        id
        status
        phase
        homeScore
        awayScore
        penaltyHomeScore
        penaltyAwayScore
      }
    }
  }
`;

const STANDINGS_QUERY = `
  query ChampionshipStandings($championshipId: Int!) {
    championshipStandings(championshipId: $championshipId) {
      id
      teamId
      pointsScored
      matchesCount
      winsCount
      drawsCount
      lossesCount
      goalsCount
      championshipPosition
      team { id name sigla shieldUrl createdByUserId }
    }
  }
`;

const MATCH_TEAM_SQUADS_QUERY = `
  query MatchTeamSquads($matchId: Int!) {
    matchTeamSquads(matchId: $matchId) {
      teamId
      activePlayers { playerId playerName yellowCards isExpelled }
      benchPlayers { playerId playerName yellowCards isExpelled }
      expelledPlayers { playerId playerName yellowCards isExpelled }
      substitutionsUsed
      substitutionsLimit
    }
  }
`;

const MATCH_DETAIL_QUERY = `
  query MatchDetail($matchId: Int!) {
    matchDetail(matchId: $matchId) {
      id
      championshipId
      status
      phase
      homeScore
      awayScore
      penaltyHomeScore
      penaltyAwayScore
      homeConfirmedAt
      awayConfirmedAt
      homeRejectedAt
      awayRejectedAt
      championship {
        id
        name
        championshipType
        responsibleUserId
        status
      }
      game {
        id
        round
        isBye
        homeTeam { id name sigla shieldUrl createdByUserId }
        awayTeam { id name sigla shieldUrl createdByUserId }
        winnerTeam { id name sigla shieldUrl createdByUserId }
      }
      events {
        id
        eventType
        minute
        note
        teamId
        userId
        createdAt
        user { id name }
        team { id name }
      }
    }
  }
`;

export async function startChampionship(
  token: string,
  championshipId: number,
): Promise<void> {
  await graphqlRequest(
    `
      mutation StartChampionship($championshipId: Int!) {
        startChampionship(championshipId: $championshipId) { id status }
      }
    `,
    { championshipId },
    token,
  );
}

export async function fetchChampionshipBracket(
  token: string,
  championshipId: number,
): Promise<BracketGame[]> {
  const data = await graphqlRequest<
    { championshipBracket: BracketGame[] },
    { championshipId: number }
  >(BRACKET_QUERY, { championshipId }, token);
  return data.championshipBracket;
}

export async function fetchChampionshipStandings(
  token: string,
  championshipId: number,
): Promise<StandingRow[]> {
  const data = await graphqlRequest<
    { championshipStandings: StandingRow[] },
    { championshipId: number }
  >(STANDINGS_QUERY, { championshipId }, token);
  return data.championshipStandings;
}

export async function fetchMatchTeamSquads(
  token: string,
  matchId: number,
): Promise<MatchTeamSquad[]> {
  const data = await graphqlRequest<
    { matchTeamSquads: MatchTeamSquad[] },
    { matchId: number }
  >(MATCH_TEAM_SQUADS_QUERY, { matchId }, token);
  return data.matchTeamSquads;
}

export async function fetchMatchDetail(
  token: string,
  matchId: number,
): Promise<MatchDetail> {
  const data = await graphqlRequest<
    { matchDetail: MatchDetail },
    { matchId: number }
  >(MATCH_DETAIL_QUERY, { matchId }, token);
  return data.matchDetail;
}

export async function startMatch(token: string, matchId: number): Promise<MatchDetail> {
  const data = await graphqlRequest<{ startMatch: MatchDetail }, { matchId: number }>(
    `
      mutation StartMatch($matchId: Int!) {
        startMatch(matchId: $matchId) {
          id status phase homeScore awayScore
        }
      }
    `,
    { matchId },
    token,
  );
  return data.startMatch as MatchDetail;
}

export async function addMatchEvent(
  token: string,
  input: AddMatchEventInput,
): Promise<void> {
  await graphqlRequest(
    `
      mutation AddMatchEvent($input: AddMatchEventInput!) {
        addMatchEvent(input: $input) { id }
      }
    `,
    { input },
    token,
  );
}

export async function removeMatchEvent(token: string, eventId: number): Promise<void> {
  await graphqlRequest(
    `
      mutation RemoveMatchEvent($eventId: Int!) {
        removeMatchEvent(eventId: $eventId)
      }
    `,
    { eventId },
    token,
  );
}

export async function startPenalties(token: string, matchId: number): Promise<void> {
  await graphqlRequest(
    `
      mutation StartPenalties($matchId: Int!) {
        startPenalties(matchId: $matchId) { id phase }
      }
    `,
    { matchId },
    token,
  );
}

export async function submitMatchResult(token: string, matchId: number): Promise<void> {
  await graphqlRequest(
    `
      mutation SubmitMatchResult($matchId: Int!) {
        submitMatchResult(matchId: $matchId) { id status }
      }
    `,
    { matchId },
    token,
  );
}

export async function confirmMatchResult(token: string, matchId: number): Promise<void> {
  await graphqlRequest(
    `
      mutation ConfirmMatchResult($matchId: Int!) {
        confirmMatchResult(matchId: $matchId) { id status }
      }
    `,
    { matchId },
    token,
  );
}

export async function rejectMatchResult(token: string, matchId: number): Promise<void> {
  await graphqlRequest(
    `
      mutation RejectMatchResult($matchId: Int!) {
        rejectMatchResult(matchId: $matchId) { id status }
      }
    `,
    { matchId },
    token,
  );
}

export function matchStatusLabel(status: MatchStatus): string {
  switch (status) {
    case 'AGENDADA':
      return 'Agendada';
    case 'EM_ANDAMENTO':
      return 'Em andamento';
    case 'AGUARDANDO_CONFIRMACAO':
      return 'Aguardando confirmação';
    case 'CONFIRMADA':
      return 'Confirmada';
    case 'REVISAO':
      return 'Em revisão';
    default:
      return status;
  }
}

export function eventTypeLabel(type: string): string {
  switch (type) {
    case 'GOL':
      return 'Gol';
    case 'CARTAO_AMARELO':
      return 'Cartão amarelo';
    case 'CARTAO_VERMELHO':
      return 'Cartão vermelho';
    case 'FALTA':
      return 'Falta';
    case 'PENALTI_GOL':
      return 'Pênalti convertido';
    case 'PENALTI_PERDIDO':
      return 'Pênalti perdido';
    case 'SUBSTITUICAO':
      return 'Substituição';
    default:
      return type;
  }
}

export function parseSubstitutionPlayerOut(note: string | null): number | null {
  if (!note) {
    return null;
  }
  try {
    const parsed = JSON.parse(note) as { playerOutId?: number };
    return typeof parsed.playerOutId === 'number' ? parsed.playerOutId : null;
  } catch {
    return null;
  }
}

export function formatSubstitutionLabel(
  playerInName: string | null | undefined,
  playerOutName: string | null | undefined,
): string {
  if (playerInName && playerOutName) {
    return `${playerOutName} → ${playerInName}`;
  }
  return playerInName ?? 'Substituição';
}

export function resolveChampionshipChampion(
  championshipType: string,
  standings: StandingRow[],
  bracket: BracketGame[],
): { teamId: number; name: string; sigla: string | null } | null {
  const byPosition = standings.find((row) => row.championshipPosition === 1);
  if (byPosition) {
    return {
      teamId: byPosition.teamId,
      name: byPosition.team.name,
      sigla: byPosition.team.sigla,
    };
  }

  if (championshipType === 'PONTOS_CORRIDOS' && standings.length > 0) {
    return {
      teamId: standings[0].teamId,
      name: standings[0].team.name,
      sigla: standings[0].team.sigla,
    };
  }

  if (championshipType === 'ELIMINATORIA') {
    const decided = bracket.filter((game) => game.winnerTeamId != null);
    if (decided.length === 0) {
      return null;
    }
    const finalRound = Math.max(...decided.map((game) => game.round));
    const finalGame =
      decided.find((game) => game.round === finalRound && game.winnerTeam) ??
      decided[decided.length - 1];
    if (!finalGame?.winnerTeam) {
      return null;
    }
    return {
      teamId: finalGame.winnerTeam.id,
      name: finalGame.winnerTeam.name,
      sigla: finalGame.winnerTeam.sigla,
    };
  }

  return null;
}
