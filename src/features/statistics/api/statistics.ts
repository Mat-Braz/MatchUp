import { graphqlRequest } from '@/lib/api/graphql';

export type PlayerChampionshipStats = {
  id: number;
  name: string;
  games: number;
  goals: number;
  yellowCards: number;
  redCards: number;
};

export type PlayerStats = {
  games: number;
  wins: number;
  goals: number;
  yellowCards: number;
  redCards: number;
  recentChampionships: PlayerChampionshipStats[];
};

const MY_PLAYER_STATS_QUERY = `
  query MyPlayerStats {
    myPlayerStats {
      games
      wins
      goals
      yellowCards
      redCards
      recentChampionships {
        id
        name
        games
        goals
        yellowCards
        redCards
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
  const yellowLabel =
    item.yellowCards === 1 ? '1 amarelo' : `${item.yellowCards} amarelos`;
  const redLabel =
    item.redCards === 1 ? '1 vermelho' : `${item.redCards} vermelhos`;

  return `${gamesLabel} • ${goalsLabel} • ${yellowLabel} • ${redLabel}`;
}
