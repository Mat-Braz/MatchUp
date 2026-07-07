import { useRouter } from 'expo-router';

import { Button } from '@/components/ui';
import { authRoutes } from '@/constants/authRoutes';
import { AuthField, AuthScaffold, StepPills } from '@/features/auth/components';

export default function AccessDataScreen() {
  const router = useRouter();

  return (
    <AuthScaffold
      eyebrow="Etapa 1 de 3"
      title="Dados de acesso"
      subtitle="Defina o e-mail e a senha que serao usados para entrar no MatchUp."
    >
      <StepPills current={1} total={4} />
      <AuthField autoCapitalize="none" keyboardType="email-address" label="E-MAIL" placeholder="seu@email.com" />
      <AuthField label="SENHA" placeholder="Crie uma senha" rightLabel="Mostrar" secureTextEntry />
      <AuthField label="CONFIRMAR SENHA" placeholder="Repita sua senha" rightLabel="Mostrar" secureTextEntry />
      <Button label="Proximo" onPress={() => router.push(authRoutes.personalData)} />
    </AuthScaffold>
  );
}
