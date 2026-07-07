import { StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';

import { authRoutes } from '@/constants/authRoutes';
import { AuthHeader, ForgotIllustration, HomeIndicator, PencilButton, PencilField, PencilScreen } from '@/features/auth/components';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  return (
    <PencilScreen scroll>
      <AuthHeader title="Esqueceu a senha?" />
      <Text style={styles.intro}>Informe seu e-mail e enviaremos um código{`\n`}de verificação.</Text>
      <PencilField label="E-MAIL" placeholder="exemplo@email.com" top={168} left={16} width={358} />
      <PencilButton label="Enviar código" top={290} left={16} width={358} height={54} onPress={() => router.push(authRoutes.resetPassword)} />
      <ForgotIllustration />
      <HomeIndicator />
    </PencilScreen>
  );
}

const styles = StyleSheet.create({
  intro: {
    position: 'absolute',
    left: 16,
    top: 96,
    width: 358,
    color: '#B9CCAF',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
});
