import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { useRouter } from 'expo-router';

import { authRoutes } from '@/constants/authRoutes';
import { theme } from '@/constants/theme';
import {
  AccountTypeCard,
  AuthTitle,
  HomeIndicator,
  PencilButton,
  PencilScreen,
  Progress,
  useRegister,
  type AccountType,
} from '@/features/auth';

export default function CreateAccountScreen() {
  const router = useRouter();
  const { draft, setAccountType } = useRegister();

  const [objects, setObjects] = useState({
    formValues: {
      accountType: (draft.accountType ?? 'athlete') as AccountType | null,
    },
    error: null as string | null,
  });

  const { formValues, error } = objects;
  const canContinue = formValues.accountType !== null;

  function handleContinue() {
    if (!formValues.accountType) {
      setObjects((current) => ({
        ...current,
        error: 'Selecione um tipo de conta para continuar.',
      }));
      return;
    }

    setAccountType(formValues.accountType);
    router.push(authRoutes.accessData);
  }

  return (
    <PencilScreen scroll>
      <AuthTitle
        title="Criar conta"
        subtitle="Escolha como você vai participar do MatchUp"
      />
      <Progress current={1} />
      <AccountTypeCard
        selected={formValues.accountType === 'athlete'}
        icon="♙"
        title="Pessoa / Atleta"
        description="Para atletas, árbitros, staff e participantes. Suas funções serão definidas em cada campeonato."
        top={215}
        onPress={() =>
          setObjects((current) => ({
            ...current,
            error: null,
            formValues: { ...current.formValues, accountType: 'athlete' },
          }))
        }
      />
      <Text style={styles.hint}>
        Você poderá completar dados específicos depois. Funções como atleta, staff ou árbitro são
        atribuídas dentro de cada campeonato.
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PencilButton label="Continuar" top={600} disabled={!canContinue} onPress={handleContinue} />
      <Text style={styles.loginLink} onPress={() => router.push(authRoutes.login)}>
        Já tenho conta
      </Text>
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
  error: {
    position: 'absolute',
    left: 24,
    top: 568,
    width: 342,
    color: theme.colors.dangerSoft,
    fontSize: 13,
    fontWeight: theme.fontWeights.semibold,
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
