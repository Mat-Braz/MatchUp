import { graphqlRequest } from '@/lib/api/graphql';

export type TokenPack = 'ONE' | 'TEN' | 'TWENTY';

export type TokenPackOffer = {
  pack: TokenPack;
  tokens: number;
  priceCents: number;
  label: string;
};

export type PurchaseResult = {
  credited: number;
  balance: number;
};

const TOKEN_CATALOG_QUERY = `
  query TokenCatalog {
    tokenCatalog {
      pack
      tokens
      priceCents
      label
    }
  }
`;

const MY_TOKEN_BALANCE_QUERY = `
  query MyTokenBalance {
    myTokenBalance {
      balance
    }
  }
`;

const PURCHASE_TOKEN_PACK_MUTATION = `
  mutation PurchaseTokenPack($pack: TokenPack!) {
    purchaseTokenPack(pack: $pack) {
      credited
      balance
    }
  }
`;

export async function fetchTokenCatalog(token: string): Promise<TokenPackOffer[]> {
  const data = await graphqlRequest<{ tokenCatalog: TokenPackOffer[] }>(
    TOKEN_CATALOG_QUERY,
    undefined,
    token,
  );
  return data.tokenCatalog;
}

export async function fetchMyTokenBalance(token: string): Promise<number> {
  const data = await graphqlRequest<{ myTokenBalance: { balance: number } }>(
    MY_TOKEN_BALANCE_QUERY,
    undefined,
    token,
  );
  return data.myTokenBalance.balance;
}

export async function purchaseTokenPack(
  token: string,
  pack: TokenPack,
): Promise<PurchaseResult> {
  const data = await graphqlRequest<
    { purchaseTokenPack: PurchaseResult },
    { pack: TokenPack }
  >(PURCHASE_TOKEN_PACK_MUTATION, { pack }, token);
  return data.purchaseTokenPack;
}
