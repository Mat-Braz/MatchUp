import type { Href } from 'expo-router';

export const protectedProfileRoutes = {
  editProfile: '/(protected)/profile-elements/edit-profile' as Href,
  statistics: '/(protected)/profile-elements/statistics' as Href,
  myTeams: '/(protected)/profile-elements/my-teams' as Href,
  myChampionships: '/(protected)/profile-elements/my-championships' as Href,
} as const;
