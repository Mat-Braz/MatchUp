import { StyleSheet, View } from 'react-native';

import type { CardBackground } from '../economy';

const PALETTE: Record<
  CardBackground,
  { base: string; mid: string; edge: string }
> = {
  BRONZE: { base: '#6B3F1F', mid: '#A66B3A', edge: '#D4A574' },
  SILVER: { base: '#5C6370', mid: '#9AA3B2', edge: '#E8ECF2' },
  GOLD: { base: '#8A6A12', mid: '#D4AF37', edge: '#F5E6A3' },
  PURPLE: { base: '#2A0A5C', mid: '#5B21B6', edge: '#67E8F9' },
  BLACK: { base: '#050505', mid: '#1A1A1A', edge: '#C9A227' },
  PINK: { base: '#3B0A24', mid: '#9D174D', edge: '#F9A8D4' },
  GREEN: { base: '#04160F', mid: '#0B3D2E', edge: '#67E8F9' },
};

type Props = {
  background: CardBackground;
  style?: object;
  /** Crest: sem anel retangular (vazava da silhueta). */
  crest?: boolean;
};

export function CardBackgroundLayer({ background, style, crest }: Props) {
  const colors = PALETTE[background];

  return (
    <View style={[styles.root, { backgroundColor: colors.base }, style]}>
      {background === 'BLACK' ? <BlackEffects /> : null}
      {background === 'GREEN' ? <GreenEffects /> : null}
      {background === 'PINK' ? <PinkEffects /> : null}
      {background === 'PURPLE' ? <PurpleEffects /> : null}

      {background !== 'BLACK' &&
      background !== 'GREEN' &&
      background !== 'PINK' &&
      background !== 'PURPLE' ? (
        <>
          <View style={[styles.midGlow, { backgroundColor: colors.mid }]} />
          <View style={[styles.topShine, { backgroundColor: colors.edge }]} />
          <View style={[styles.bottomFade, { backgroundColor: colors.base }]} />
        </>
      ) : null}

      <View style={[styles.statsScrim, crest && styles.statsScrimCrest]} />
      {crest ? null : (
        <View style={[styles.borderRing, { borderColor: colors.edge }]} />
      )}
    </View>
  );
}

/** Roxo: royal purple + faixas magenta energéticas + borda cyan. */
function PurpleEffects() {
  return (
    <>
      <View style={styles.purpleTop} />
      <View style={styles.purpleBottom} />
      <View style={styles.purpleMidGlow} />

      <View style={[styles.purpleRay, styles.purpleRayA]} />
      <View style={[styles.purpleRay, styles.purpleRayB]} />
      <View style={[styles.purpleRay, styles.purpleRayC]} />
      <View style={[styles.purpleRay, styles.purpleRayD]} />

      <View style={[styles.magentaSweep, styles.magentaSweepA]} />
      <View style={[styles.magentaSweep, styles.magentaSweepB]} />
      <View style={[styles.magentaSweep, styles.magentaSweepC]} />
      <View style={[styles.magentaSweep, styles.magentaSweepD]} />

      <View style={styles.purpleEmblemOuter}>
        <View style={styles.purpleEmblemInner} />
      </View>

      <View style={styles.purpleCyanLip} />
    </>
  );
}

/** Preta: faixas douradas verticais + base charcoal mate (estilo Libertadores). */
function BlackEffects() {
  return (
    <>
      <View style={styles.blackTop} />
      <View style={styles.blackBottom} />
      <View style={[styles.goldRibbon, styles.ribbonA]} />
      <View style={[styles.goldRibbon, styles.ribbonB]} />
      <View style={[styles.goldRibbon, styles.ribbonC]} />
      <View style={[styles.goldRibbon, styles.ribbonD]} />
      <View style={[styles.goldRibbon, styles.ribbonE]} />
      <View style={styles.goldLip} />
    </>
  );
}

/** Verde: rachaduras cyan + glitch nas bordas. */
function GreenEffects() {
  return (
    <>
      <View style={styles.greenGlow} />
      <View style={styles.greenHatch} />
      <View style={[styles.crack, styles.crackA]} />
      <View style={[styles.crack, styles.crackB]} />
      <View style={[styles.crack, styles.crackC]} />
      <View style={[styles.crack, styles.crackD]} />
      <View style={[styles.crack, styles.crackE]} />
      <View style={[styles.glitchDot, styles.glitchL1, { backgroundColor: '#F43F5E' }]} />
      <View style={[styles.glitchDot, styles.glitchL2, { backgroundColor: '#22D3EE' }]} />
      <View style={[styles.glitchDot, styles.glitchR1, { backgroundColor: '#22D3EE' }]} />
      <View style={[styles.glitchDot, styles.glitchR2, { backgroundColor: '#F472B6' }]} />
      <View style={styles.greenOrb} />
    </>
  );
}

/** Rosa: pinceladas diagonais + flare central + contorno dourado fino. */
function PinkEffects() {
  return (
    <>
      <View style={styles.pinkBase} />
      <View style={[styles.brush, styles.brushA]} />
      <View style={[styles.brush, styles.brushB]} />
      <View style={[styles.brush, styles.brushC]} />
      <View style={[styles.brushOutline, styles.brushOutlineA]} />
      <View style={[styles.brushOutline, styles.brushOutlineB]} />
      <View style={styles.pinkFlare} />
      <View style={styles.pinkSpeckA} />
      <View style={styles.pinkSpeckB} />
      <View style={styles.pinkSpeckC} />
      <View style={styles.pinkDivider} />
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  midGlow: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    top: '12%',
    bottom: '18%',
    borderRadius: 40,
    opacity: 0.42,
  },
  topShine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '42%',
    opacity: 0.16,
  },
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
    opacity: 0.45,
  },
  statsScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '42%',
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  statsScrimCrest: {
    height: '36%',
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  borderRing: {
    ...StyleSheet.absoluteFill,
    borderWidth: 2,
    borderRadius: 18,
    opacity: 0.85,
  },
  // —— PURPLE ——
  purpleTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '55%',
    backgroundColor: '#4C1D95',
  },
  purpleBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    backgroundColor: '#1E0848',
  },
  purpleMidGlow: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    top: '18%',
    height: '38%',
    borderRadius: 60,
    backgroundColor: '#7C3AED',
    opacity: 0.35,
  },
  purpleRay: {
    position: 'absolute',
    height: 1.5,
    backgroundColor: 'rgba(196, 181, 253, 0.35)',
    borderRadius: 2,
  },
  purpleRayA: {
    top: '10%',
    left: '6%',
    width: '28%',
    transform: [{ rotate: '-28deg' }],
  },
  purpleRayB: {
    top: '14%',
    left: '4%',
    width: '22%',
    transform: [{ rotate: '-18deg' }],
    opacity: 0.45,
  },
  purpleRayC: {
    top: '18%',
    left: '8%',
    width: '18%',
    transform: [{ rotate: '-8deg' }],
    opacity: 0.3,
  },
  purpleRayD: {
    top: '12%',
    left: '10%',
    width: '14%',
    transform: [{ rotate: '-38deg' }],
    opacity: 0.25,
  },
  magentaSweep: {
    position: 'absolute',
    height: 22,
    borderRadius: 4,
    backgroundColor: '#EC4899',
  },
  magentaSweepA: {
    top: '28%',
    left: '-8%',
    width: '78%',
    height: 28,
    opacity: 0.85,
    transform: [{ rotate: '-6deg' }],
    backgroundColor: '#F472B6',
  },
  magentaSweepB: {
    top: '36%',
    left: '8%',
    width: '95%',
    height: 20,
    opacity: 0.7,
    transform: [{ rotate: '3deg' }],
    backgroundColor: '#DB2777',
  },
  magentaSweepC: {
    top: '42%',
    right: '-12%',
    width: '70%',
    height: 16,
    opacity: 0.55,
    transform: [{ rotate: '-4deg' }],
    backgroundColor: '#BE185D',
  },
  magentaSweepD: {
    top: '32%',
    left: '35%',
    width: '55%',
    height: 10,
    opacity: 0.4,
    transform: [{ rotate: '8deg' }],
    backgroundColor: '#FB7185',
  },
  purpleEmblemOuter: {
    position: 'absolute',
    top: 12,
    left: '44%',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#6D28D9',
    borderWidth: 1.5,
    borderColor: '#C4B5FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  purpleEmblemInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E9D5FF',
    opacity: 0.75,
  },
  purpleCyanLip: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    top: '48%',
    height: 2,
    backgroundColor: '#67E8F9',
    opacity: 0.45,
  },

  // —— BLACK ——
  blackTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '48%',
    backgroundColor: '#000000',
  },
  blackBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '52%',
    backgroundColor: '#1A1A1A',
  },
  goldRibbon: {
    position: 'absolute',
    top: -8,
    borderRadius: 10,
    backgroundColor: '#D4AF37',
  },
  ribbonA: {
    left: '14%',
    width: 5,
    height: '48%',
    opacity: 0.28,
    transform: [{ rotate: '9deg' }],
  },
  ribbonB: {
    left: '28%',
    width: 11,
    height: '52%',
    opacity: 0.55,
    transform: [{ rotate: '5deg' }],
    backgroundColor: '#F5D76E',
  },
  ribbonC: {
    left: '46%',
    width: 7,
    height: '46%',
    opacity: 0.4,
    transform: [{ rotate: '-2deg' }],
  },
  ribbonD: {
    left: '60%',
    width: 13,
    height: '50%',
    opacity: 0.48,
    transform: [{ rotate: '-6deg' }],
    backgroundColor: '#E8C547',
  },
  ribbonE: {
    left: '76%',
    width: 6,
    height: '44%',
    opacity: 0.32,
    transform: [{ rotate: '-10deg' }],
  },
  goldLip: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    top: '47%',
    height: 2,
    backgroundColor: '#C9A227',
    opacity: 0.55,
  },

  // —— GREEN ——
  greenGlow: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    top: '8%',
    height: '42%',
    borderRadius: 80,
    backgroundColor: '#14B8A6',
    opacity: 0.22,
  },
  greenHatch: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    backgroundColor: '#062A1F',
    opacity: 0.85,
  },
  crack: {
    position: 'absolute',
    backgroundColor: '#67E8F9',
    opacity: 0.75,
  },
  crackA: {
    top: '18%',
    left: '38%',
    width: 2.5,
    height: 78,
    transform: [{ rotate: '28deg' }],
  },
  crackB: {
    top: '24%',
    left: '34%',
    width: 95,
    height: 2,
    transform: [{ rotate: '-22deg' }],
  },
  crackC: {
    top: '30%',
    left: '52%',
    width: 2,
    height: 62,
    transform: [{ rotate: '-35deg' }],
    backgroundColor: '#A5F3FC',
  },
  crackD: {
    top: '20%',
    left: '48%',
    width: 55,
    height: 1.5,
    transform: [{ rotate: '40deg' }],
    opacity: 0.55,
  },
  crackE: {
    top: '36%',
    left: '28%',
    width: 40,
    height: 1.5,
    transform: [{ rotate: '12deg' }],
    opacity: 0.5,
  },
  glitchDot: {
    position: 'absolute',
    width: 5,
    height: 14,
    borderRadius: 1,
  },
  glitchL1: { left: 0, top: '32%' },
  glitchL2: { left: 0, top: '48%', height: 10, width: 4 },
  glitchR1: { right: 0, top: '28%', height: 16 },
  glitchR2: { right: 0, top: '44%', height: 8, width: 3 },
  greenOrb: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    left: '46%',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#F43F5E',
    opacity: 0.9,
    borderWidth: 1,
    borderColor: '#FDA4AF',
  },

  // —— PINK ——
  pinkBase: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#4C0519',
  },
  brush: {
    position: 'absolute',
    height: 34,
    borderRadius: 18,
    opacity: 0.7,
  },
  brushA: {
    top: '12%',
    left: '-18%',
    width: '78%',
    backgroundColor: '#F472B6',
    transform: [{ rotate: '-20deg' }],
  },
  brushB: {
    top: '22%',
    right: '-20%',
    width: '72%',
    backgroundColor: '#A21CAF',
    transform: [{ rotate: '24deg' }],
    opacity: 0.65,
  },
  brushC: {
    top: '30%',
    left: '5%',
    width: '60%',
    backgroundColor: '#DB2777',
    transform: [{ rotate: '-8deg' }],
    height: 26,
  },
  brushOutline: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#FDE68A',
    opacity: 0.7,
  },
  brushOutlineA: {
    top: '19%',
    left: '5%',
    width: '48%',
    transform: [{ rotate: '-20deg' }],
  },
  brushOutlineB: {
    top: '29%',
    right: '8%',
    width: '40%',
    transform: [{ rotate: '24deg' }],
  },
  pinkFlare: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '44%',
    height: 12,
    backgroundColor: '#FFFFFF',
    opacity: 0.2,
  },
  pinkSpeckA: {
    position: 'absolute',
    top: '16%',
    left: '70%',
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    opacity: 0.55,
  },
  pinkSpeckB: {
    position: 'absolute',
    top: '38%',
    left: '22%',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
    opacity: 0.4,
  },
  pinkSpeckC: {
    position: 'absolute',
    top: '26%',
    left: '55%',
    width: 2.5,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: '#FDE68A',
    opacity: 0.5,
  },
  pinkDivider: {
    position: 'absolute',
    left: '12%',
    right: '12%',
    top: '52%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
});
