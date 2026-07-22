export type CardBackground =
  | 'BRONZE'
  | 'SILVER'
  | 'GOLD'
  | 'PURPLE'
  | 'BLACK'
  | 'PINK'
  | 'GREEN';

/** SHIELD legado — tratado como SQUARE na UI. */
export type CardShape = 'SQUARE' | 'SHIELD' | 'CREST';

export type CardAttributeKey =
  | 'pace'
  | 'shooting'
  | 'passing'
  | 'dribbling'
  | 'defense'
  | 'physical';

export type PlayerCardAttributes = Record<CardAttributeKey, number>;

export type PlayerCardView = {
  userId: number;
  name: string;
  avatarUrl: string | null;
  shape: CardShape;
  background: CardBackground;
  ownedBackgrounds: CardBackground[];
  ownedShapes: CardShape[];
  unlockedBackgrounds: CardBackground[];
  unlockedShapes: CardShape[];
  baseAttributes: PlayerCardAttributes;
  spent: PlayerCardAttributes;
  attributes: PlayerCardAttributes;
  overall: number;
  naturalOverall: number;
  rawScore: number;
  spendablePoints: number;
  remainingPoints: number;
  games: number;
  wins: number;
  goals: number;
  yellowCards: number;
  redCards: number;
};

export const CARD_ATTRIBUTE_KEYS: CardAttributeKey[] = [
  'pace',
  'shooting',
  'passing',
  'dribbling',
  'defense',
  'physical',
];

export const CARD_ATTRIBUTE_LABELS: Record<CardAttributeKey, string> = {
  pace: 'Velocidade',
  shooting: 'Finalização',
  passing: 'Passe',
  dribbling: 'Drible',
  defense: 'Defesa',
  physical: 'Físico',
};

export const CARD_ATTRIBUTE_SHORT: Record<CardAttributeKey, string> = {
  pace: 'VEL',
  shooting: 'FIN',
  passing: 'PAS',
  dribbling: 'DRI',
  defense: 'DEF',
  physical: 'FIS',
};

export const ALL_BACKGROUNDS: CardBackground[] = [
  'BRONZE',
  'SILVER',
  'GOLD',
  'PURPLE',
  'BLACK',
  'PINK',
  'GREEN',
];

/** Só 2 formatos na UI: retângulo (grátis) + Crest (token). */
export const ALL_SHAPES: CardShape[] = ['SQUARE', 'CREST'];

export const PURCHASABLE_BACKGROUNDS: CardBackground[] = ['PINK', 'GREEN'];
export const PURCHASABLE_SHAPES: CardShape[] = ['CREST'];

export const BACKGROUND_LABELS: Record<CardBackground, string> = {
  BRONZE: 'Bronze',
  SILVER: 'Prata',
  GOLD: 'Ouro',
  PURPLE: 'Roxo',
  BLACK: 'Preto',
  PINK: 'Rosa',
  GREEN: 'Verde',
};

export const SHAPE_LABELS: Record<CardShape, string> = {
  SQUARE: 'Retângulo',
  SHIELD: 'Retângulo',
  CREST: 'Crest',
};

/** Normaliza shape legado SHIELD → SQUARE. */
export function normalizeCardShape(shape: CardShape): CardShape {
  return shape === 'SHIELD' ? 'SQUARE' : shape;
}

export function isPurchasableBackground(bg: CardBackground): boolean {
  return PURCHASABLE_BACKGROUNDS.includes(bg);
}

export function isPurchasableShape(shape: CardShape): boolean {
  return PURCHASABLE_SHAPES.includes(shape);
}

export function isBackgroundUnlocked(
  bg: CardBackground,
  unlocked: CardBackground[],
): boolean {
  return unlocked.includes(bg);
}
