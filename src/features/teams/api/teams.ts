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
  createdByUserId: number;
  isCreator: boolean;
};

export type CreateTeamInput = {
  name: string;
  sigla?: string;
  shieldUrl?: string;
};

export type UpdateTeamInput = {
  name?: string;
  sigla?: string;
  shieldUrl?: string | null;
};

export type TeamDetails = {
  id: number;
  name: string;
  sigla: string | null;
  shieldUrl: string | null;
  squadSize: number | null;
  formation: string | null;
  lineup: string | null;
  createdByUserId: number;
};

export type TeamMember = {
  playerTeamId: number;
  playerId: number;
  playerName: string;
  avatarUrl: string | null;
  role: PlayerTeamRole;
  position: string | null;
};

export type UserSearchItem = {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
};

export type LineupSlotInput = {
  slotId: string;
  playerId: number;
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
      createdByUserId
      isCreator
    }
  }
`;

const CREATE_TEAM_MUTATION = `
  mutation CreateTeam($input: CreateTeamInput!) {
    createTeam(input: $input) {
      id
      name
      sigla
      createdByUserId
      shieldUrl
    }
  }
`;

const UPDATE_TEAM_MUTATION = `
  mutation UpdateTeam($id: Int!, $input: UpdateTeamInput!) {
    updateTeam(id: $id, input: $input) {
      id
      name
      sigla
      shieldUrl
    }
  }
`;

const TEAM_QUERY = `
  query Team($id: Int!) {
    team(id: $id) {
      id
      name
      sigla
      shieldUrl
      squadSize
      formation
      lineup
      createdByUserId
    }
  }
`;

const TEAM_MEMBERS_QUERY = `
  query TeamMembers($teamId: Int!) {
    teamMembers(teamId: $teamId) {
      playerTeamId
      playerId
      playerName
      avatarUrl
      role
      position
    }
  }
`;

const SEARCH_USERS_QUERY = `
  query SearchUsers($filters: UserFilterInput) {
    users(filters: $filters) {
      id
      name
      email
      avatarUrl
    }
  }
`;

const INVITE_PLAYER_MUTATION = `
  mutation InvitePlayerToTeam($teamId: Int!, $playerId: Int!) {
    invitePlayerToTeam(teamId: $teamId, playerId: $playerId) {
      id
      status
      type
    }
  }
`;

const SAVE_TEAM_LINEUP_MUTATION = `
  mutation SaveTeamLineup($input: SaveTeamLineupInput!) {
    saveTeamLineup(input: $input) {
      id
      squadSize
      formation
      lineup
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

export async function createTeam(
  token: string,
  input: CreateTeamInput,
): Promise<{ id: number; name: string; sigla: string | null; createdByUserId: number }> {
  const data = await graphqlRequest<
    {
      createTeam: {
        id: number;
        name: string;
        sigla: string | null;
        createdByUserId: number;
      };
    },
    { input: CreateTeamInput }
  >(CREATE_TEAM_MUTATION, { input }, token);
  return data.createTeam;
}

export async function updateTeam(
  token: string,
  id: number,
  input: UpdateTeamInput,
): Promise<void> {
  await graphqlRequest(UPDATE_TEAM_MUTATION, { id, input }, token);
}

export async function fetchTeam(
  token: string,
  id: number,
): Promise<TeamDetails> {
  const data = await graphqlRequest<{ team: TeamDetails }, { id: number }>(
    TEAM_QUERY,
    { id },
    token,
  );
  return data.team;
}

export function parseLineupAssignments(
  lineup: string | null | undefined,
): Record<string, number> {
  if (!lineup) {
    return {};
  }

  try {
    const parsed = JSON.parse(lineup) as { slotId?: string; playerId?: number }[];
    if (!Array.isArray(parsed)) {
      return {};
    }

    const assignments: Record<string, number> = {};
    for (const slot of parsed) {
      if (slot?.slotId && typeof slot.playerId === 'number') {
        assignments[slot.slotId] = slot.playerId;
      }
    }
    return assignments;
  } catch {
    return {};
  }
}

export async function fetchTeamMembers(
  token: string,
  teamId: number,
): Promise<TeamMember[]> {
  const data = await graphqlRequest<
    { teamMembers: TeamMember[] },
    { teamId: number }
  >(TEAM_MEMBERS_QUERY, { teamId }, token);
  return data.teamMembers;
}

export async function searchUsers(
  token: string,
  query: string,
): Promise<UserSearchItem[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const data = await graphqlRequest<
    { users: UserSearchItem[] },
    { filters: { name?: string; email?: string } }
  >(
    SEARCH_USERS_QUERY,
    {
      filters: trimmed.includes('@')
        ? { email: trimmed }
        : { name: trimmed },
    },
    token,
  );
  return data.users;
}

export async function invitePlayerToTeam(
  token: string,
  teamId: number,
  playerId: number,
): Promise<void> {
  await graphqlRequest(
    INVITE_PLAYER_MUTATION,
    { teamId, playerId },
    token,
  );
}

export async function saveTeamLineup(
  token: string,
  input: {
    teamId: number;
    squadSize: number;
    formation: string;
    slots: LineupSlotInput[];
  },
): Promise<void> {
  await graphqlRequest(SAVE_TEAM_LINEUP_MUTATION, { input }, token);
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
  const roleLabel = item.isCreator ? 'Criador' : formatTeamRoleLabel(item);
  const membersLabel =
    item.membersCount === 1 ? '1 membro' : `${item.membersCount} membros`;

  return `${roleLabel} • ${membersLabel}`;
}
