import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui';
import { authRoutes } from '@/constants/authRoutes';
import { theme } from '@/constants/theme';
import { AuthLink, AuthScaffold, StepPills } from '@/features/auth/components';

export default function VerifyCodeScreen() {
  const router = useRouter();

  return (
    <AuthScaffold
      eyebrow="Etapa 3 de 3"
      title="Verifique seu codigo"
      subtitle="Digite o codigo de 6 digitos enviado para o seu e-mail."
      footer={<AuthLink href={authRoutes.login} label="Voltar para login" strong />}
    >
      <StepPills current={3} total={4} />
      <View style={styles.codeRow}>
        {Array.from({ length: 6 }).map((_, index) => (
          <View key={index} style={styles.codeBox}>
            <Text style={styles.codeText}>{index === 0 ? '0' : ''}</Text>
          </View>
        ))}
      </View>
      <AuthLink href={authRoutes.verifyCode} label="Reenviar codigo" align="right" />
      <Button label="Verificar" onPress={() => router.replace('/(protected)')} />
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  codeRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  codeBox: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.input,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surfaceLow,
  },
  codeText: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: theme.fontWeights.black,
  },
});
