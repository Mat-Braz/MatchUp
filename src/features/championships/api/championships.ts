import { graphqlRequest } from '@/lib/api/graphql';

export type ChampionshipStatus = 'INSCRICOES_ABERTAS' | 'EM_ANDAMENTO' | 'ENCERRADO';

export type MyChampionshipsScope = 'ALL' | 'PARTICIPATING' | 'CREATED';

export type MyChampionshipRelation = 'PARTICIPATING' | 'CREATED';

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
  responsibleTeamId: number;
};

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
  responsibleTeamId
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
