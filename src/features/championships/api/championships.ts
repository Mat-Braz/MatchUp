import { graphqlRequest } from '@/lib/api/graphql';

export type ChampionshipStatus = 'INSCRICOES_ABERTAS' | 'EM_ANDAMENTO' | 'ENCERRADO';

export type MyChampionshipsScope = 'ALL' | 'PARTICIPATING' | 'CREATED';

export type MyChampionshipRelation = 'PARTICIPATING' | 'CREATED';

export type ChampionshipType =
  | 'ELIMINATORIA'
  | 'PONTOS_CORRIDOS'
  | 'X1'
  | 'GRUPOS_MATA_MATA';

export type Championship = {
  id: number;
  name: string;
  championshipType: string;
  status: ChampionshipStatus;
  finished: boolean;
  isPublic: boolean;
  startsAt: string | null;
  endsAt: string | null;
  teamsCount: number;
  responsibleUserId: number;
};

export type CreateChampionshipInput = {
  name: string;
  description?: string;
  city?: string;
  uf?: string;
  championshipType: ChampionshipType;
  maxParticipants?: number;
  hasTrophy?: boolean;
  hasMedal?: boolean;
  hasCashPrize?: boolean;
  prizeFirst?: number;
  prizeSecond?: number;
  prizeThird?: number;
  rulesEnabled?: boolean;
  yellowCardLimit?: number;
  redCardLimit?: number;
  substitutions?: number;
  isPublic?: boolean;
};

export type UpdateChampionshipInput = Partial<CreateChampionshipInput> & {
  status?: ChampionshipStatus;
  finished?: boolean;
};

export type ChampionshipDetails = Championship & {
  description: string | null;
  city: string | null;
  uf: string | null;
  maxParticipants: number | null;
  hasTrophy: boolean;
  hasMedal: boolean;
  hasCashPrize: boolean;
  prizeFirst: number | null;
  prizeSecond: number | null;
  prizeThird: number | null;
  rulesEnabled: boolean;
  yellowCardLimit: number | null;
  redCardLimit: number | null;
  substitutions: number | null;
};

export type ChampionshipTeamItem = {
  id: number;
  name: string;
  sigla: string | null;
  shieldUrl: string | null;
  createdByUserId: number;
};

export type TeamSearchItem = {
  id: number;
  name: string;
  sigla: string | null;
  shieldUrl: string | null;
  createdByUserId: number;
};

const CREATE_CHAMPIONSHIP_MUTATION = `
  mutation CreateChampionship($input: CreateChampionshipInput!) {
    createChampionship(input: $input) {
      id
      name
      championshipType
      status
      isPublic
      maxParticipants
      city
      uf
    }
  }
`;

export async function createChampionship(
  token: string,
  input: CreateChampionshipInput,
): Promise<{ id: number; name: string }> {
  const data = await graphqlRequest<
    { createChampionship: { id: number; name: string } },
    { input: CreateChampionshipInput }
  >(CREATE_CHAMPIONSHIP_MUTATION, { input }, token);
  return data.createChampionship;
}

const CHAMPIONSHIP_DETAIL_FIELDS = `
  id
  name
  description
  city
  uf
  championshipType
  status
  finished
  isPublic
  startsAt
  endsAt
  teamsCount
  responsibleUserId
  maxParticipants
  hasTrophy
  hasMedal
  hasCashPrize
  prizeFirst
  prizeSecond
  prizeThird
  rulesEnabled
  yellowCardLimit
  redCardLimit
  substitutions
`;

const CHAMPIONSHIP_QUERY = `
  query Championship($id: Int!) {
    championship(id: $id) {
      ${CHAMPIONSHIP_DETAIL_FIELDS}
    }
  }
`;

const UPDATE_CHAMPIONSHIP_MUTATION = `
  mutation UpdateChampionship($id: Int!, $input: UpdateChampionshipInput!) {
    updateChampionship(id: $id, input: $input) {
      id
      name
    }
  }
`;

const REMOVE_CHAMPIONSHIP_MUTATION = `
  mutation RemoveChampionship($id: Int!) {
    removeChampionship(id: $id) {
      id
    }
  }
`;

const INVITE_TEAM_MUTATION = `
  mutation InviteTeamToChampionship($championshipId: Int!, $teamId: Int!) {
    inviteTeamToChampionship(championshipId: $championshipId, teamId: $teamId) {
      id
      status
    }
  }
`;

const REQUEST_JOIN_MUTATION = `
  mutation RequestJoinChampionship($championshipId: Int!, $teamId: Int!) {
    requestJoinChampionship(championshipId: $championshipId, teamId: $teamId) {
      id
      status
    }
  }
`;

const CHAMPIONSHIP_TEAMS_QUERY = `
  query ChampionshipTeams($championshipId: Int!) {
    championshipTeams(championshipId: $championshipId) {
      id
      name
      sigla
      shieldUrl
      createdByUserId
    }
  }
`;

const SEARCH_TEAMS_QUERY = `
  query SearchTeams($filters: TeamFilterInput) {
    teams(filters: $filters) {
      id
      name
      sigla
      shieldUrl
      createdByUserId
    }
  }
`;

export async function fetchChampionship(
  token: string,
  id: number,
): Promise<ChampionshipDetails> {
  const data = await graphqlRequest<
    { championship: ChampionshipDetails },
    { id: number }
  >(CHAMPIONSHIP_QUERY, { id }, token);
  return data.championship;
}

export async function updateChampionship(
  token: string,
  id: number,
  input: UpdateChampionshipInput,
): Promise<void> {
  await graphqlRequest(UPDATE_CHAMPIONSHIP_MUTATION, { id, input }, token);
}

export async function removeChampionship(token: string, id: number): Promise<void> {
  await graphqlRequest(REMOVE_CHAMPIONSHIP_MUTATION, { id }, token);
}

export async function inviteTeamToChampionship(
  token: string,
  championshipId: number,
  teamId: number,
): Promise<void> {
  await graphqlRequest(INVITE_TEAM_MUTATION, { championshipId, teamId }, token);
}

export async function requestJoinChampionship(
  token: string,
  championshipId: number,
  teamId: number,
): Promise<void> {
  await graphqlRequest(REQUEST_JOIN_MUTATION, { championshipId, teamId }, token);
}

export async function fetchChampionshipTeams(
  token: string,
  championshipId: number,
): Promise<ChampionshipTeamItem[]> {
  const data = await graphqlRequest<
    { championshipTeams: ChampionshipTeamItem[] },
    { championshipId: number }
  >(CHAMPIONSHIP_TEAMS_QUERY, { championshipId }, token);
  return data.championshipTeams;
}

export async function searchTeams(
  token: string,
  name: string,
): Promise<TeamSearchItem[]> {
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return [];
  }
  const data = await graphqlRequest<
    { teams: TeamSearchItem[] },
    { filters: { name: string } }
  >(SEARCH_TEAMS_QUERY, { filters: { name: trimmed } }, token);
  return data.teams;
}


export type MyChampionshipItem = {
  id: number;
  name: string;
  status: ChampionshipStatus;
  relation: MyChampionshipRelation;
  createdByMe: boolean;
  participating: boolean;
};

const CHAMPIONSHIP_FIELDS = `
  id
  name
  championshipType
  status
  finished
  isPublic
  startsAt
  endsAt
  teamsCount
  responsibleUserId
`;

const RECOMMENDED_CHAMPIONSHIPS_QUERY = `
  query RecommendedChampionships {
    recommendedChampionships {
      ${CHAMPIONSHIP_FIELDS}
    }
  }
`;

const MY_CHAMPIONSHIPS_QUERY = `
  query MyChampionships {
    myChampionships {
      ${CHAMPIONSHIP_FIELDS}
    }
  }
`;

const MY_PROFILE_CHAMPIONSHIPS_QUERY = `
  query MyProfileChampionships($scope: MyChampionshipsScope) {
    myProfileChampionships(scope: $scope) {
      id
      name
      status
      relation
      createdByMe
      participating
    }
  }
`;

export async function fetchRecommendedChampionships(token: string): Promise<Championship[]> {
  const data = await graphqlRequest<{ recommendedChampionships: Championship[] }>(
    RECOMMENDED_CHAMPIONSHIPS_QUERY,
    undefined,
    token,
  );
  return data.recommendedChampionships;
}

export async function fetchMyChampionships(token: string): Promise<Championship[]> {
  const data = await graphqlRequest<{ myChampionships: Championship[] }>(
    MY_CHAMPIONSHIPS_QUERY,
    undefined,
    token,
  );
  return data.myChampionships;
}

export async function fetchMyProfileChampionships(
  token: string,
  scope: MyChampionshipsScope = 'ALL',
): Promise<MyChampionshipItem[]> {
  const data = await graphqlRequest<
    { myProfileChampionships: MyChampionshipItem[] },
    { scope: MyChampionshipsScope }
  >(MY_PROFILE_CHAMPIONSHIPS_QUERY, { scope }, token);
  return data.myProfileChampionships;
}

export function championshipStatusLabel(status: ChampionshipStatus): string {
  switch (status) {
    case 'INSCRICOES_ABERTAS':
      return 'Inscrições abertas';
    case 'EM_ANDAMENTO':
      return 'Em andamento';
    case 'ENCERRADO':
      return 'Encerrado';
    default:
      return status;
  }
}

export function championshipStatusLabelSoft(status: ChampionshipStatus): string {
  switch (status) {
    case 'INSCRICOES_ABERTAS':
      return 'inscrições abertas';
    case 'EM_ANDAMENTO':
      return 'em andamento';
    case 'ENCERRADO':
      return 'encerrado';
    default: {
      const exhaustive: never = status;
      return String(exhaustive);
    }
  }
}

export function formatMyChampionshipSubtitle(item: MyChampionshipItem): string {
  const relationLabel =
    item.relation === 'CREATED' ? 'Criado por você' : 'Participando';
  return `${relationLabel} • ${championshipStatusLabelSoft(item.status)}`;
}

export function formatChampionshipDates(startsAt: string | null, endsAt: string | null): string {
  if (!startsAt && !endsAt) {
    return 'Datas a definir';
  }

  const start = startsAt ? formatShortDate(startsAt) : '—';
  const end = endsAt ? formatShortDate(endsAt) : '—';
  return `${start} — ${end}`;
}

export function championshipYear(startsAt: string | null, endsAt: string | null): string {
  const source = startsAt ?? endsAt;
  if (!source) {
    return '—';
  }
  return String(new Date(source).getFullYear());
}

function formatShortDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = String(date.getUTCFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

export function teamsCountLabel(count: number): string {
  return count === 1 ? '1 time' : `${count} times`;
}
