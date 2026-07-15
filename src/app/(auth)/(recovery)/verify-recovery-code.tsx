import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useRouter } from 'expo-router';

import { authRoutes } from '@/constants/authRoutes';
import { theme } from '@/constants/theme';
import {
  AuthHeader,
  CodeInputs,
  HomeIndicator,
  OtpIllustration,
  PencilButton,
  PencilScreen,
  sendPasswordResetCodeRequest,
  useRecovery,
} from '@/features/auth';
import { ApiError } from '@/lib/api/graphql';
import { onlyDigits } from '@/lib/masks';

export default function VerifyRecoveryCodeScreen() {
  const router = useRouter();
  const { draft, hasEmail, setCode } = useRecovery();

  const [objects, setObjects] = useState({
    formValues: {
      code: '',
    },
    error: null as string | null,
  });
  const [booleans, setBooleans] = useState({
    sending: false,
  });

  const { formValues, error } = objects;
  const { sending } = booleans;
  const canContinue = onlyDigits(formValues.code).length === 5 && !sending;

  useEffect(() => {
    if (!hasEmail) {
      router.replace(authRoutes.forgotPassword);
    }
  }, [hasEmail, router]);

  async function handleResend() {
    if (sending) {
      return;
    }

    setBooleans((current) => ({ ...current, sending: true }));
    setObjects((current) => ({ ...current, error: null }));

    try {
      await sendPasswordResetCodeRequest(draft.email);
    } catch (err) {
      setObjects((current) => ({
        ...current,
        error:
          err instanceof ApiError
            ? err.message === 'Wait a moment before requesting a new code'
              ? 'Aguarde um minuto para reenviar o código.'
              : err.message === 'Email not registered'
                ? 'Não encontramos uma conta com este e-mail.'
                : err.message
            : 'Não foi possível reenviar o código.',
      }));
    } finally {
      setBooleans((current) => ({ ...current, sending: false }));
    }
  }

  function handleContinue() {
    if (!canContinue) {
      setObjects((current) => ({
        ...current,
        error: 'Digite o código de 5 dígitos.',
      }));
      return;
    }

    setCode(onlyDigits(formValues.code));
    router.push(authRoutes.resetPassword);
  }

  if (!hasEmail) {
    return null;
  }

  return (
    <PencilScreen scroll>
      <AuthHeader
        title="Verificação"
        onBack={() => router.replace(authRoutes.forgotPassword)}
      />
      <Text style={styles.instruction}>
        Digite o código de 5 dígitos enviado para{`\n`}
        <Text style={styles.email}>{draft.email}</Text>.
      </Text>
      <CodeInputs
        value={formValues.code}
        onChange={(code) =>
          setObjects((current) => ({
            ...current,
            error: null,
            formValues: { ...current.formValues, code },
          }))
        }
        editable={!sending}
      />
      <Pressable onPress={handleResend} disabled={sending} style={styles.resendButton}>
        <Text style={[styles.resend, sending && styles.resendDisabled]}>
          {sending ? 'Enviando...' : 'Reenviar código'}
        </Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <OtpIllustration />
      <PencilButton
        label="Continuar"
        top={738}
        left={20}
        width={350}
        height={58}
        disabled={!canContinue}
        onPress={handleContinue}
      />
      <HomeIndicator top={829} />
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
  email: {
    color: theme.colors.primarySoft,
    fontWeight: theme.fontWeights.bold,
  },
  resendButton: {
    position: 'absolute',
    left: 20,
    top: 324,
    width: 350,
  },
  resend: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: theme.fontWeights.extraBold,
    textAlign: 'center',
  },
  resendDisabled: {
    opacity: 0.55,
  },
  error: {
    position: 'absolute',
    left: 20,
    top: 360,
    width: 350,
    color: theme.colors.dangerSoft,
    fontSize: 13,
    fontWeight: theme.fontWeights.semibold,
    textAlign: 'center',
  },
});
