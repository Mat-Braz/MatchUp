import { useRouter } from 'expo-router';

import { Button } from '@/components/ui';
import { authRoutes } from '@/constants/authRoutes';
import { AuthField, AuthLink, AuthScaffold } from '@/features/auth/components';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  return (
    <AuthScaffold
      eyebrow="Recuperar acesso"
      title="Esqueceu a senha?"
      subtitle="Informe seu e-mail para receber o codigo de recuperacao."
      footer={<AuthLink href={authRoutes.login} label="Lembrei minha senha" strong />}
    >
      <AuthField autoCapitalize="none" keyboardType="email-address" label="E-MAIL" placeholder="seu@email.com" />
      <Button label="Enviar codigo" onPress={() => router.push(authRoutes.resetPassword)} />
    </AuthScaffold>
  );
}
