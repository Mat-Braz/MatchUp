import { graphqlRequest } from '@/lib/api/graphql';

import type {
  CardBackground,
  CardShape,
  PlayerCardAttributes,
  PlayerCardView,
} from '../economy';

const PLAYER_CARD_FIELDS = `
  userId
  name
  avatarUrl
  shape
  background
  ownedBackgrounds
  ownedShapes
  unlockedBackgrounds
  unlockedShapes
  baseAttributes {
    pace
    shooting
    passing
    dribbling
    defense
    physical
  }
  spent {
    pace
    shooting
    passing
    dribbling
    defense
    physical
  }
  attributes {
    pace
    shooting
    passing
    dribbling
    defense
    physical
  }
  overall
  naturalOverall
  rawScore
  spendablePoints
  remainingPoints
  games
  wins
  goals
  yellowCards
  redCards
`;

const MY_PLAYER_CARD_QUERY = `
  query MyPlayerCard {
    myPlayerCard {
      ${PLAYER_CARD_FIELDS}
    }
  }
`;

const PLAYER_CARD_QUERY = `
  query PlayerCard($userId: Int!) {
    playerCard(userId: $userId) {
      ${PLAYER_CARD_FIELDS}
    }
  }
`;

const UPDATE_MY_PLAYER_CARD_MUTATION = `
  mutation UpdateMyPlayerCard($input: UpdateMyPlayerCardInput!) {
    updateMyPlayerCard(input: $input) {
      ${PLAYER_CARD_FIELDS}
    }
  }
`;

const ALLOCATE_POINTS_MUTATION = `
  mutation AllocatePlayerCardPoints($input: AllocatePlayerCardPointsInput!) {
    allocatePlayerCardPoints(input: $input) {
      ${PLAYER_CARD_FIELDS}
    }
  }
`;

const RESET_POINTS_MUTATION = `
  mutation ResetPlayerCardPoints {
    resetPlayerCardPoints {
      ${PLAYER_CARD_FIELDS}
    }
  }
`;

const PURCHASE_BACKGROUND_MUTATION = `
  mutation PurchasePlayerCardBackground($input: PurchasePlayerCardBackgroundInput!) {
    purchasePlayerCardBackground(input: $input) {
      ${PLAYER_CARD_FIELDS}
    }
  }
`;

const PURCHASE_SHAPE_MUTATION = `
  mutation PurchasePlayerCardShape($input: PurchasePlayerCardShapeInput!) {
    purchasePlayerCardShape(input: $input) {
      ${PLAYER_CARD_FIELDS}
    }
  }
`;

export async function fetchMyPlayerCard(token: string): Promise<PlayerCardView> {
  const data = await graphqlRequest<{ myPlayerCard: PlayerCardView }>(
    MY_PLAYER_CARD_QUERY,
    undefined,
    token,
  );
  return data.myPlayerCard;
}

export async function fetchPlayerCard(
  token: string,
  userId: number,
): Promise<PlayerCardView> {
  const data = await graphqlRequest<
    { playerCard: PlayerCardView },
    { userId: number }
  >(PLAYER_CARD_QUERY, { userId }, token);
  return data.playerCard;
}

export async function updateMyPlayerCard(
  token: string,
  input: { shape?: CardShape; background?: CardBackground },
): Promise<PlayerCardView> {
  const data = await graphqlRequest<
    { updateMyPlayerCard: PlayerCardView },
    { input: { shape?: CardShape; background?: CardBackground } }
  >(UPDATE_MY_PLAYER_CARD_MUTATION, { input }, token);
  return data.updateMyPlayerCard;
}

export async function allocatePlayerCardPoints(
  token: string,
  input: Partial<PlayerCardAttributes>,
): Promise<PlayerCardView> {
  const data = await graphqlRequest<
    { allocatePlayerCardPoints: PlayerCardView },
    { input: Partial<PlayerCardAttributes> }
  >(ALLOCATE_POINTS_MUTATION, { input }, token);
  return data.allocatePlayerCardPoints;
}

export async function resetPlayerCardPoints(
  token: string,
): Promise<PlayerCardView> {
  const data = await graphqlRequest<{ resetPlayerCardPoints: PlayerCardView }>(
    RESET_POINTS_MUTATION,
    undefined,
    token,
  );
  return data.resetPlayerCardPoints;
}

export async function purchasePlayerCardBackground(
  token: string,
  background: CardBackground,
): Promise<PlayerCardView> {
  const data = await graphqlRequest<
    { purchasePlayerCardBackground: PlayerCardView },
    { input: { background: CardBackground } }
  >(PURCHASE_BACKGROUND_MUTATION, { input: { background } }, token);
  return data.purchasePlayerCardBackground;
}

export async function purchasePlayerCardShape(
  token: string,
  shape: CardShape,
): Promise<PlayerCardView> {
  const data = await graphqlRequest<
    { purchasePlayerCardShape: PlayerCardView },
    { input: { shape: CardShape } }
  >(PURCHASE_SHAPE_MUTATION, { input: { shape } }, token);
  return data.purchasePlayerCardShape;
}
