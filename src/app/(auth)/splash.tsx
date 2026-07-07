import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen } from '@/components/ui';
import { authRoutes } from '@/constants/authRoutes';
import { theme } from '@/constants/theme';
import { BrandLogo } from '@/features/auth/components';

export default function SplashScreen() {
  const router = useRouter();
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1400,
        useNativeDriver: true,
      }),
    );

    animation.start();
    return () => animation.stop();
  }, [rotation]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Screen contentStyle={styles.screen} scroll={false}>
      <View style={styles.hero}>
        <BrandLogo />
        <Text style={styles.tagline}>Campeonatos, times e partidas no mesmo campo.</Text>
      </View>

      <View style={styles.ballStage}>
        <View style={styles.orbit} />
        <Animated.Text style={[styles.ball, { transform: [{ rotate: spin }] }]}>⚽</Animated.Text>
      </View>

      <Pressable style={styles.cta} onPress={() => router.push(authRoutes.login)}>
        <Text style={styles.ctaText}>Entrar no MatchUp</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 88,
  },
  hero: {
    gap: theme.spacing.xxl,
  },
  tagline: {
    maxWidth: 290,
    color: theme.colors.textMuted,
    fontSize: 18,
    fontWeight: theme.fontWeights.semibold,
    lineHeight: 25,
  },
  ballStage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbit: {
    position: 'absolute',
    width: 178,
    height: 178,
    borderRadius: 89,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surfaceLow,
  },
  ball: {
    fontSize: 118,
  },
  cta: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.button,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  ctaText: {
    color: theme.colors.black,
    fontSize: 15,
    fontWeight: theme.fontWeights.black,
  },
});
