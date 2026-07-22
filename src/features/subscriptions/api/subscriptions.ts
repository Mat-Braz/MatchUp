import { graphqlRequest } from '@/lib/api/graphql';

export type SubscriptionPlan = 'MONTHLY' | 'YEARLY';

export type SubscriptionPlanOffer = {
  plan: SubscriptionPlan;
  tokensPerCycle: number;
  priceCents: number;
  cycleDays: number;
  label: string;
};

export type SubscribeResult = {
  credited: number;
  balance: number;
};

const SUBSCRIPTION_CATALOG_QUERY = `
  query SubscriptionCatalog {
    subscriptionCatalog {
      plan
      tokensPerCycle
      priceCents
      cycleDays
      label
    }
  }
`;

const SUBSCRIBE_PLAN_MUTATION = `
  mutation SubscribePlan($plan: SubscriptionPlan!) {
    subscribePlan(plan: $plan) {
      credited
      balance
    }
  }
`;

export async function fetchSubscriptionCatalog(
  token: string,
): Promise<SubscriptionPlanOffer[]> {
  const data = await graphqlRequest<{ subscriptionCatalog: SubscriptionPlanOffer[] }>(
    SUBSCRIPTION_CATALOG_QUERY,
    undefined,
    token,
  );
  return data.subscriptionCatalog;
}

export async function subscribePlan(
  token: string,
  plan: SubscriptionPlan,
): Promise<SubscribeResult> {
  const data = await graphqlRequest<
    { subscribePlan: SubscribeResult },
    { plan: SubscriptionPlan }
  >(SUBSCRIBE_PLAN_MUTATION, { plan }, token);
  return data.subscribePlan;
}
