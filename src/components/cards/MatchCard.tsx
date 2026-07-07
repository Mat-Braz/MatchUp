import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type MatchCardProps = {
  phase: string;
  status: string;
  teamA: string;
  score: string;
  teamB: string;
  meta: string;
};

export function MatchCard({ phase, status, teamA, score, teamB, meta }: MatchCardProps) {
  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <Text style={styles.kicker}>{phase}</Text>
        <Text style={styles.kicker}>{status}</Text>
      </View>

      <View style={styles.scoreRow}>
        <Text style={styles.team}>{teamA}</Text>
        <Text style={styles.score}>{score}</Text>
        <Text style={styles.team}>{teamB}</Text>
      </View>

      <Text style={styles.meta}>{meta}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceLow,
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  kicker: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption,
    fontWeight: theme.fontWeights.black,
  },
  team: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: theme.fontWeights.extraBold,
  },
  score: {
    color: theme.colors.primary,
    fontSize: theme.typography.heading,
    fontWeight: theme.fontWeights.bold,
  },
  meta: {
    color: theme.colors.textDim,
    fontSize: theme.typography.small,
    fontWeight: theme.fontWeights.bold,
  },
});
