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
  eventType: string;
  minute?: number | null;
  note?: string | null;
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
      homeTeam { id name sigla createdByUserId }
      awayTeam { id name sigla createdByUserId }
      winnerTeam { id name sigla createdByUserId }
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
      team { id name sigla createdByUserId }
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
        homeTeam { id name sigla createdByUserId }
        awayTeam { id name sigla createdByUserId }
        winnerTeam { id name sigla createdByUserId }
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
    default:
      return type;
  }
}
