/**
 * Silhueta FUT — viewBox 0 0 200 300
 * Base rasa (quase sem alongamento até a ponta), como a carta de referência.
 */
export const CREST_VIEWBOX = {
  width: 200,
  height: 300,
} as const;

export const CREST_PATH =
  'M6 44 ' +
  'C18 28 36 14 56 8 ' +
  'C66 5 74 5 80 8 ' +
  'C88 12 94 8 100 2 ' +
  'C106 8 112 12 120 8 ' +
  'C126 5 134 5 144 8 ' +
  'C164 14 182 28 194 44 ' +
  // laterais longas + base em V raso e angular (não curva mole)
  'L194 262 ' +
  'L100 298 ' +
  'L6 262 ' +
  'L6 44 ' +
  'Z';

/** Contorno interno (Crest) — inset ~8. */
export const CREST_INNER_PATH =
  'M14 48 ' +
  'C26 34 42 22 58 17 ' +
  'C68 14 74 14 80 17 ' +
  'C87 20 93 17 100 12 ' +
  'C107 17 113 20 120 17 ' +
  'C126 14 132 14 142 17 ' +
  'C158 22 174 34 186 48 ' +
  'L186 258 ' +
  'L100 288 ' +
  'L14 258 ' +
  'L14 48 ' +
  'Z';
