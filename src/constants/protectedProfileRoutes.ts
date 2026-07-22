import type { Href } from 'expo-router';

import { teamRoutes } from '@/constants/teamRoutes';

export const protectedProfileRoutes = {
  editProfile: '/(protected)/profile-elements/edit-profile' as Href,
  statistics: '/(protected)/profile-elements/statistics' as Href,
  myTeams: '/(protected)/profile-elements/my-teams' as Href,
  createTeam: teamRoutes.form as Href,
  myChampionships: '/(protected)/profile-elements/my-championships' as Href,
  myCard: '/(protected)/profile-elements/my-card' as Href,
  distributePoints: '/(protected)/profile-elements/card-points' as Href,
} as const;
