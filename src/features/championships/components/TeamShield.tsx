import { Image, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import type { BracketTeam } from '@/features/championships';

type TeamShieldProps = {
  team: BracketTeam | null | undefined;
  size?: number;
  variant?: 'light' | 'dark';
};

export function TeamShield({
  team,
  size = 48,
  variant = 'light',
}: TeamShieldProps) {
  const light = variant === 'light';
  const hasTeam = team != null;
  const initial = (team?.sigla ?? team?.name ?? '').slice(0, 1).toUpperCase();

  return (
    <View
      style={[
        styles.shield,
        {
          width: size,
          height: size,
          borderRadius: Math.max(6, size * 0.16),
          backgroundColor: light
            ? hasTeam
              ? '#FFFFFF'
              : 'rgba(255,255,255,0.72)'
            : theme.colors.surfaceHigh,
          borderColor: light ? '#D8D8DE' : theme.colors.borderStrong,
          borderStyle: hasTeam ? 'solid' : 'dashed',
        },
      ]}
    >
      {team?.shieldUrl ? (
        <Image
          source={{ uri: team.shieldUrl }}
          style={{ width: size * 0.78, height: size * 0.78 }}
          resizeMode="contain"
        />
      ) : hasTeam && initial ? (
        <Text
          style={[
            styles.initial,
            {
              fontSize: size * 0.34,
              color: light ? theme.colors.black : theme.colors.primarySoft,
            },
          ]}
        >
          {initial}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shield: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  initial: {
    fontWeight: theme.fontWeights.extraBold,
  },
});
