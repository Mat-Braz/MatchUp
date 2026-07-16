import { graphqlRequest } from '@/lib/api/graphql';

export type PlayerChampionshipStats = {
  id: number;
  name: string;
  games: number;
  goals: number;
  assists: number;
};

export type PlayerStats = {
  games: number;
  wins: number;
  goals: number;
  assists: number;
  cards: number;
  recentChampionships: PlayerChampionshipStats[];
};

const MY_PLAYER_STATS_QUERY = `
  query MyPlayerStats {
    myPlayerStats {
      games
      wins
      goals
      assists
      cards
      recentChampionships {
        id
        name
        games
        goals
        assists
      }
    }
  }
`;

export async function fetchMyPlayerStats(token: string): Promise<PlayerStats> {
  const data = await graphqlRequest<{ myPlayerStats: PlayerStats }>(
    MY_PLAYER_STATS_QUERY,
    undefined,
    token,
  );
  return data.myPlayerStats;
}

export function formatChampionshipMeta(item: PlayerChampionshipStats): string {
  const gamesLabel = item.games === 1 ? '1 jogo' : `${item.games} jogos`;
  const goalsLabel = item.goals === 1 ? '1 gol' : `${item.goals} gols`;
  const assistsLabel =
    item.assists === 1 ? '1 assistência' : `${item.assists} assistências`;

  return `${gamesLabel} • ${goalsLabel} • ${assistsLabel}`;
}
