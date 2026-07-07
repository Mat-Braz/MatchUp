import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui';
import { authRoutes } from '@/constants/authRoutes';
import { theme } from '@/constants/theme';
import { AuthLink, AuthScaffold, StepPills } from '@/features/auth/components';

export default function CreateAccountScreen() {
  const router = useRouter();

  return (
    <AuthScaffold
      eyebrow="Criar conta"
      title="Entre como atleta"
      subtitle="A conta institucional fica para uma etapa futura. Agora vamos preparar seu acesso de jogador."
      footer={
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Ja tem conta?</Text>
          <AuthLink href={authRoutes.login} label="Entrar" strong />
        </View>
      }
    >
      <StepPills current={0} total={4} />
      <View style={styles.card}>
        <Text style={styles.cardKicker}>Perfil disponivel</Text>
        <Text style={styles.cardTitle}>Atleta</Text>
        <Text style={styles.cardText}>Crie sua conta para acessar campeonatos, times, partidas e sua carta de atleta.</Text>
      </View>
      <Button label="Continuar" onPress={() => router.push(authRoutes.accessData)} />
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surfaceLow,
    padding: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  cardKicker: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption,
    fontWeight: theme.fontWeights.black,
    textTransform: 'uppercase',
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: theme.fontWeights.black,
  },
  cardText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    fontWeight: theme.fontWeights.semibold,
    lineHeight: 20,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: theme.fontWeights.bold,
  },
});
