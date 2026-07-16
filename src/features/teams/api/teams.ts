import { graphqlRequest } from '@/lib/api/graphql';

export type PlayerTeamRole = 'PLAYER' | 'COACH';

export type MyTeamItem = {
  id: number;
  teamId: number;
  teamName: string;
  shieldUrl: string | null;
  role: PlayerTeamRole;
  position: string | null;
  membersCount: number;
};

const MY_TEAMS_QUERY = `
  query MyTeams {
    myTeams {
      id
      teamId
      teamName
      shieldUrl
      role
      position
      membersCount
    }
  }
`;

export async function fetchMyTeams(token: string): Promise<MyTeamItem[]> {
  const data = await graphqlRequest<{ myTeams: MyTeamItem[] }>(
    MY_TEAMS_QUERY,
    undefined,
    token,
  );
  return data.myTeams;
}

export function formatTeamRoleLabel(item: Pick<MyTeamItem, 'role' | 'position'>): string {
  const position = item.position?.trim().toLowerCase() ?? '';

  if (position.includes('capit')) {
    return 'Capitão';
  }

  if (item.role === 'COACH' || position.includes('técnico') || position.includes('tecnico')) {
    return 'Técnico';
  }

  return 'Atleta';
}

export function formatTeamSubtitle(item: MyTeamItem): string {
  const roleLabel = formatTeamRoleLabel(item);
  const membersLabel =
    item.membersCount === 1 ? '1 membro' : `${item.membersCount} membros`;

  return `${roleLabel} • ${membersLabel}`;
}
