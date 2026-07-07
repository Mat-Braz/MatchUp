import { useRouter } from 'expo-router';

import { authRoutes } from '@/constants/authRoutes';
import { AuthTitle, HomeIndicator, PencilButton, PencilField, PencilScreen, Progress } from '@/features/auth/components';

export default function PersonalDataScreen() {
  const router = useRouter();

  return (
    <PencilScreen scroll>
      <AuthTitle title="Dados pessoais" subtitle="Complete seu perfil para participar dos campeonatos" />
      <Progress current={3} />
      <PencilField label="DATA DE NASCIMENTO" placeholder="00/00/0000" top={192} />
      <PencilField label="TELEFONE" placeholder="(00) 00000-0000" top={286} />
      <PencilField label="CEP" placeholder="00000-000" top={380} />
      <PencilField label="CIDADE" placeholder="Sua cidade" top={474} />
      <PencilField label="ESTADO" placeholder="UF" top={568} />
      <PencilButton label="Criar conta" top={683} onPress={() => router.push(authRoutes.verifyCode)} />
      <HomeIndicator top={829} />
    </PencilScreen>
  );
}
