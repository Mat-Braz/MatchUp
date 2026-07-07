import { useRouter } from 'expo-router';

import { Button } from '@/components/ui';
import { authRoutes } from '@/constants/authRoutes';
import { AuthField, AuthLink, AuthScaffold } from '@/features/auth/components';

export default function ResetPasswordScreen() {
  const router = useRouter();

  return (
    <AuthScaffold
      eyebrow="Nova senha"
      title="Redefinir senha"
      subtitle="Use o codigo recebido e defina uma nova senha para sua conta."
      footer={<AuthLink href={authRoutes.login} label="Voltar para login" strong />}
    >
      <AuthField keyboardType="number-pad" label="CODIGO" placeholder="000000" />
      <AuthField label="NOVA SENHA" placeholder="Digite a nova senha" rightLabel="Mostrar" secureTextEntry />
      <AuthField label="CONFIRMAR SENHA" placeholder="Repita a nova senha" rightLabel="Mostrar" secureTextEntry />
      <Button label="Salvar senha" onPress={() => router.replace(authRoutes.login)} />
    </AuthScaffold>
  );
}
