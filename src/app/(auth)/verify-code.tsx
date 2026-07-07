import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { theme } from '@/constants/theme';
import { AuthHeader, CodeInputs, ConfirmationOverlay, HomeIndicator, OtpIllustration, PencilButton, PencilScreen } from '@/features/auth/components';

export default function VerifyCodeScreen() {
  const router = useRouter();

  return (
    <PencilScreen scroll>
      <AuthHeader title="Verificação" />
      <Text style={styles.instruction}>Digite o código de 5 dígitos enviado para{`\n`}o seu e-mail.</Text>
      <CodeInputs />
      <Text style={styles.resend}>Reenviar código</Text>
      <OtpIllustration />
      <PencilButton label="Verificar" top={738} left={20} width={350} height={58} onPress={() => router.replace('/(protected)')} />
      <HomeIndicator top={829} />
      <ConfirmationOverlay title={`Conta criada\ncom sucesso`} message={`Seu cadastro foi realizado, agora você já\npode entrar com sua conta`} buttonLabel="IR PARA O LOGIN" />
    </PencilScreen>
  );
}

const styles = StyleSheet.create({
  instruction: {
    position: 'absolute',
    left: 20,
    top: 108,
    width: 350,
    color: '#C5C4CC',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 24,
  },
  resend: {
    position: 'absolute',
    left: 20,
    top: 324,
    width: 350,
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: theme.fontWeights.extraBold,
    textAlign: 'center',
  },
});
