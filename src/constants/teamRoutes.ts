export const teamRoutes = {
  tab: '/(protected)/(tabs)/teams',
  /** Shared create / edit screen */
  form: '/(protected)/team-wizard/form',
  edit: (teamId: number) => `/(protected)/team-wizard/form?teamId=${teamId}`,
  /** @deprecated use form */
  create: '/(protected)/team-wizard/form',
} as const;
