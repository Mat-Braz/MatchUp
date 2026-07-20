export {
  createTeam,
  fetchMyTeams,
  fetchTeam,
  fetchTeamMembers,
  formatTeamRoleLabel,
  formatTeamSubtitle,
  invitePlayerToTeam,
  parseLineupAssignments,
  saveTeamLineup,
  searchUsers,
  updateTeam,
} from './api/teams';
export type {
  CreateTeamInput,
  LineupSlotInput,
  MyTeamItem,
  PlayerTeamRole,
  TeamDetails,
  TeamMember,
  UpdateTeamInput,
  UserSearchItem,
} from './api/teams';
export {
  FIELD_FORMATIONS,
  FUTSAL_FORMATIONS,
  formationsForSquadSize,
  getFormation,
} from './formations';
export type { FormationDefinition, FormationSlot, SquadSize } from './formations';
export { TeamCreateProvider, useTeamCreate } from './context/TeamCreateContext';
export { TeamEditor } from './components/TeamEditor';
