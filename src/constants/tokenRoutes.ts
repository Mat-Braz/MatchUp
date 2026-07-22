export const tokenRoutes = {
  noTokens: '/(protected)/championships/tokens/no-tokens',
  buy: '/(protected)/championships/tokens/buy',
  added: '/(protected)/championships/tokens/added',
  subscriptions: '/(protected)/championships/tokens/subscriptions',
  noTokensWithReason: (reason: TokenFlowReason) =>
    `/(protected)/championships/tokens/no-tokens?reason=${reason}`,
  buyWithReason: (reason: TokenFlowReason) =>
    `/(protected)/championships/tokens/buy?reason=${reason}`,
  addedWithParams: (params: {
    reason: TokenFlowReason;
    credited: number;
    balance: number;
  }) =>
    `/(protected)/championships/tokens/added?reason=${params.reason}&credited=${params.credited}&balance=${params.balance}`,
} as const;

export type TokenFlowReason = 'championship' | 'card' | 'general';
