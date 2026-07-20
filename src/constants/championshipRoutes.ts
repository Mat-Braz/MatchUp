export const championshipRoutes = {
  create: '/(protected)/championships/create',
  createStep: (step: number) => `/(protected)/championships/create/${step}`,
  edit: (championshipId: number) =>
    `/(protected)/championships/create/1?championshipId=${championshipId}`,
  detail: (championshipId: number) =>
    `/(protected)/championships/${championshipId}`,
  match: (championshipId: number, matchId: number) =>
    `/(protected)/championships/${championshipId}/match/${matchId}`,
  success: '/(protected)/championships/create/success',
  noTokens: '/(protected)/championships/tokens/no-tokens',
  buyTokens: '/(protected)/championships/tokens/buy',
  subscriptions: '/(protected)/championships/tokens/subscriptions',
  tokensAdded: '/(protected)/championships/tokens/added',
} as const;
