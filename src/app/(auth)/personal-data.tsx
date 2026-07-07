import { useRouter } from 'expo-router';

import { Button } from '@/components/ui';
import { authRoutes } from '@/constants/authRoutes';
import { AuthField, AuthScaffold, StepPills } from '@/features/auth/components';

export default function PersonalDataScreen() {
  const router = useRouter();

  return (
    <AuthScaffold
      eyebrow="Etapa 2 de 3"
      title="Dados pessoais"
      subtitle="Complete seu perfil para que organizadores e times reconhecam voce."
    >
      <StepPills current={2} total={4} />
      <AuthField autoCapitalize="words" label="NOME COMPLETO" placeholder="Seu nome" />
      <AuthField keyboardType="number-pad" label="DATA DE NASCIMENTO" placeholder="DD/MM/AAAA" />
      <AuthField autoCapitalize="words" label="CIDADE" placeholder="Sua cidade" />
      <AuthField autoCapitalize="characters" label="POSICAO" placeholder="Ex: ATA, MEI, ZAG" />
      <Button label="Enviar codigo" onPress={() => router.push(authRoutes.verifyCode)} />
    </AuthScaffold>
  );
}
