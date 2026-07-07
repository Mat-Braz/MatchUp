import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { authRoutes } from '@/constants/authRoutes';
import { theme } from '@/constants/theme';
import { AccountTypeCard, AuthTitle, HomeIndicator, PencilButton, PencilScreen, Progress } from '@/features/auth/components';

export default function CreateAccountScreen() {
  const router = useRouter();

  return (
    <PencilScreen scroll>
      <AuthTitle title="Criar conta" subtitle="Escolha como você vai participar do MatchUp" />
      <Progress current={1} />
      <AccountTypeCard
        selected
        icon="♙"
        title="Pessoa / Atleta"
        description="Para atletas, árbitros, staff e participantes. Suas funções serão definidas em cada campeonato."
        top={215}
      />
      <Text style={styles.hint}>Você poderá completar dados específicos depois. Funções como atleta, staff ou árbitro são atribuídas dentro de cada campeonato.</Text>
      <PencilButton label="Continuar" top={600} onPress={() => router.push(authRoutes.accessData)} />
      <Text style={styles.loginLink} onPress={() => router.push(authRoutes.login)}>Já tenho conta</Text>
      <HomeIndicator top={829} />
    </PencilScreen>
  );
}

const styles = StyleSheet.create({
  hint: {
    position: 'absolute',
    left: 24,
    top: 390,
    width: 342,
    color: '#80808A',
    fontSize: 13,
    fontWeight: theme.fontWeights.semibold,
    lineHeight: 18,
  },
  loginLink: {
    position: 'absolute',
    left: 24,
    top: 672,
    width: 342,
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: theme.fontWeights.extraBold,
    textAlign: 'center',
  },
});
