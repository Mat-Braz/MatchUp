import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useRouter } from 'expo-router';

import { authRoutes } from '@/constants/authRoutes';
import { theme } from '@/constants/theme';
import {
  AuthHeader,
  ForgotIllustration,
  PencilButton,
  PencilField,
  PencilScreen,
  sendPasswordResetCodeRequest,
  useRecovery,
} from '@/features/auth';
import { ApiError } from '@/lib/api/graphql';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { setEmail } = useRecovery();

  const [objects, setObjects] = useState({
    formValues: {
      email: '',
    },
    error: null as string | null,
  });
  const [booleans, setBooleans] = useState({
    sending: false,
  });

  const { formValues, error } = objects;
  const { sending } = booleans;
  const canSend = formValues.email.trim().length > 0 && !sending;

  async function handleSendCode() {
    if (!canSend) {
      setObjects((current) => ({
        ...current,
        error: 'Informe o e-mail da sua conta.',
      }));
      return;
    }

    const normalizedEmail = formValues.email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setObjects((current) => ({
        ...current,
        error: 'Digite um e-mail válido, tipo nome@email.com',
      }));
      return;
    }

    setBooleans((current) => ({ ...current, sending: true }));
    setObjects((current) => ({ ...current, error: null }));

    try {
      await sendPasswordResetCodeRequest(normalizedEmail);
      setEmail(normalizedEmail);
      router.push(authRoutes.verifyRecoveryCode);
    } catch (err) {
      setObjects((current) => ({
        ...current,
        error:
          err instanceof ApiError
            ? err.message === 'Email not registered'
              ? 'Não encontramos uma conta com este e-mail.'
              : err.message === 'Wait a moment before requesting a new code'
                ? 'Aguarde um minuto para solicitar um novo código.'
                : err.message
            : 'Não foi possível enviar o código. Tente novamente.',
      }));
    } finally {
      setBooleans((current) => ({ ...current, sending: false }));
    }
  }

  return (
    <PencilScreen>
      <View style={styles.content}>
        <AuthHeader title="Esqueceu a senha?" onBack={() => router.replace(authRoutes.login)} />
        <Text style={styles.intro}>
          Informe seu e-mail e enviaremos um código{`\n`}de verificação.
        </Text>
        <PencilField
          label="E-MAIL"
          placeholder="exemplo@email.com"
          top={168}
          left={16}
          width={358}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="emailAddress"
          value={formValues.email}
          onChangeText={(email) =>
            setObjects((current) => ({
              ...current,
              error: null,
              formValues: { ...current.formValues, email },
            }))
          }
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PencilButton
          label={sending ? 'Enviando...' : 'Enviar código'}
          top={290}
          left={16}
          width={358}
          height={54}
          disabled={!canSend}
          onPress={handleSendCode}
        />
        <ForgotIllustration />
      </View>
    </PencilScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    transform: [{ translateY: 48 }],
  },
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
  error: {
    position: 'absolute',
    left: 16,
    top: 250,
    width: 358,
    color: theme.colors.dangerSoft,
    fontSize: 13,
    fontWeight: theme.fontWeights.semibold,
  },
});
