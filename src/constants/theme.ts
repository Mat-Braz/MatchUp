export const colors = {
  background: '#000000',
  surfaceLow: '#0C0E14',
  surface: '#12131A',
  surfaceCard: '#18181B',
  surfaceHigh: '#282A31',
  border: '#27272A',
  borderStrong: '#3B4B35',
  primary: '#00FF00',
  primarySoft: '#77FF61',
  primaryPale: '#EAFFDE',
  danger: '#DC2626',
  dangerDark: '#450A0A',
  dangerSoft: '#F87171',
  text: '#E2E1EB',
  textMuted: '#B9CCAF',
  textDim: '#84967C',
  black: '#000000',
  transparent: '#00000000',
} as const;

export const fonts = {
  body: 'Inter',
  data: 'IBM Plex Mono',
} as const;

export const fontWeights = {
  regular: '400',
  semibold: '600',
  bold: '700',
  extraBold: '800',
  black: '900',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 18,
  xxl: 24,
  screen: 16,
} as const;

export const radius = {
  button: 8,
  input: 12,
  card: 16,
  screen: 28,
  pill: 999,
} as const;

export const typography = {
  caption: 11,
  small: 12,
  body: 14,
  title: 22,
  heading: 28,
  metric: 42,
} as const;

export const theme = {
  colors,
  fonts,
  fontWeights,
  spacing,
  radius,
  typography,
} as const;

export type AppTheme = typeof theme;
