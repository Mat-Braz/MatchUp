import { useState } from 'react';
import { useRouter } from 'expo-router';

import { authRoutes } from '@/constants/authRoutes';
import { AuthTitle, HomeIndicator, PencilButton, PencilField, PencilScreen, Progress, SecurityCard } from '@/features/auth/components';

export default function AccessDataScreen() {
  const router = useRouter();
  const [showSecurity, setShowSecurity] = useState(false);

  return (
    <PencilScreen scroll>
      <AuthTitle title="Dados de acesso" subtitle="Crie sua conta de pessoa ou atleta" />
      <Progress current={2} />
      <PencilField label="NOME COMPLETO" placeholder="Digite seu nome" top={183} />
      <PencilField label="E-MAIL" placeholder="exemplo@email.com" top={277} />
      <PencilField icon="⌾" label="SENHA" onFocus={() => setShowSecurity(true)} placeholder="Min. 8 caracteres" secure top={371} />
      {showSecurity ? <SecurityCard compact top={455} /> : null}
      <PencilField icon="⌾" label="CONFIRMAR SENHA" placeholder="Repita sua senha" secure top={showSecurity ? 562 : 465} />
      <PencilButton label="Continuar" top={686} onPress={() => router.push(authRoutes.personalData)} />
      <HomeIndicator top={829} />
    </PencilScreen>
  );
}
