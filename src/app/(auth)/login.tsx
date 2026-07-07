import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui';
import { authRoutes } from '@/constants/authRoutes';
import { theme } from '@/constants/theme';
import { AuthField, AuthLink, AuthScaffold } from '@/features/auth/components';

export default function LoginScreen() {
  const router = useRouter();

  return (
    <AuthScaffold
      title="Entrar"
      subtitle="Acesse seus campeonatos e partidas"
      footer={
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Nao tem conta?</Text>
          <AuthLink href={authRoutes.createAccount} label="Criar conta" strong />
        </View>
      }
    >
      <AuthField autoCapitalize="none" keyboardType="email-address" label="E-MAIL" placeholder="seu@email.com" />
      <AuthField label="SENHA" placeholder="Digite sua senha" rightLabel="Mostrar" secureTextEntry />

      <View style={styles.actions}>
        <AuthLink align="right" href={authRoutes.forgotPassword} label="Esqueceu a senha?" />
        <Button label="Entrar" onPress={() => router.replace('/(protected)')} />
      </View>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 14,
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
