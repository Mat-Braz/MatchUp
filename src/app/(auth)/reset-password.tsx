import { StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';

import { authRoutes } from '@/constants/authRoutes';
import { AuthHeader, ConfirmationOverlay, HomeIndicator, PencilButton, PencilField, PencilScreen, SecurityCard } from '@/features/auth/components';

export default function ResetPasswordScreen() {
  const router = useRouter();

  return (
    <PencilScreen scroll>
      <AuthHeader title="Redefinir senha" />
      <Text style={styles.intro}>Crie uma nova senha para acessar sua conta.</Text>
      <PencilField icon="⌾" label="NOVA SENHA" placeholder="••••••••" secure top={204} left={20} width={350} />
      <PencilField icon="⌾" label="CONFIRMAR NOVA SENHA" placeholder="••••••••" secure top={326} left={20} width={350} />
      <SecurityCard />
      <PencilButton label="Redefinir senha" top={754} left={20} width={350} height={58} onPress={() => router.replace(authRoutes.login)} />
      <HomeIndicator />
      <ConfirmationOverlay title={`Senha alterada com\nsucesso`} message={`Sua senha foi alterada, agora você já\npode entrar com ela`} buttonLabel="VOLTAR AO LOGIN" />
    </PencilScreen>
  );
}

const styles = StyleSheet.create({
  intro: {
    position: 'absolute',
    left: 20,
    top: 126,
    width: 350,
    color: '#B7B6C0',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
});
