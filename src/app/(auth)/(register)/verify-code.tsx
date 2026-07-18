import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useRouter } from 'expo-router';

import { authRoutes } from '@/constants/authRoutes';
import { theme } from '@/constants/theme';
import {
  AuthHeader,
  CodeInputs,
  ConfirmationOverlay,
  HomeIndicator,
  OtpIllustration,
  PencilButton,
  PencilScreen,
  sendVerificationCodeRequest,
  useAuth,
  useRegister,
} from '@/features/auth';
import { ApiError } from '@/lib/api/graphql';
import { birthDateToIso, onlyDigits } from '@/lib/masks';

export default function VerifyCodeScreen() {
  const router = useRouter();
  const { draft, hasCompleteDraft, clearDraft } = useRegister();
  const { completeRegistration } = useAuth();

  const [objects, setObjects] = useState({
    formValues: {
      code: '',
    },
    error: null as string | null,
  });
  const [booleans, setBooleans] = useState({
    sending: false,
    verifying: false,
    showSuccess: false,
  });

  const { formValues, error } = objects;
  const { sending, verifying, showSuccess } = booleans;
  const canVerify = onlyDigits(formValues.code).length === 5 && !verifying && !sending;

  useEffect(() => {
    if (!hasCompleteDraft) {
      router.replace(authRoutes.createAccount);
    }
  }, [hasCompleteDraft, router]);

  useEffect(() => {
    if (!hasCompleteDraft || !draft.email) {
      return;
    }

    let cancelled = false;

    (async () => {
      setBooleans((current) => ({ ...current, sending: true }));
      setObjects((current) => ({ ...current, error: null }));

      try {
        await sendVerificationCodeRequest(draft.email);
      } catch (err) {
        if (!cancelled) {
          setObjects((current) => ({
            ...current,
            error:
              err instanceof ApiError
                ? err.message === 'Email already registered'
                  ? 'Este e-mail já está cadastrado.'
                  : err.message === 'Wait a moment before requesting a new code'
                    ? 'Aguarde um minuto para reenviar o código.'
                    : err.message
                : 'Não foi possível enviar o código. Tente novamente.',
          }));
        }
      } finally {
        if (!cancelled) {
          setBooleans((current) => ({ ...current, sending: false }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [draft.email, hasCompleteDraft]);

  async function handleResend() {
    if (sending || verifying) {
      return;
    }

    setBooleans((current) => ({ ...current, sending: true }));
    setObjects((current) => ({ ...current, error: null }));

    try {
      await sendVerificationCodeRequest(draft.email);
    } catch (err) {
      setObjects((current) => ({
        ...current,
        error:
          err instanceof ApiError
            ? err.message === 'Wait a moment before requesting a new code'
              ? 'Aguarde um minuto para reenviar o código.'
              : err.message === 'Email already registered'
                ? 'Este e-mail já está cadastrado.'
                : err.message
            : 'Não foi possível reenviar o código.',
      }));
    } finally {
      setBooleans((current) => ({ ...current, sending: false }));
    }
  }

  async function handleVerify() {
    if (!canVerify) {
      setObjects((current) => ({
        ...current,
        error: 'Digite o código de 5 dígitos.',
      }));
      return;
    }

    const birthDate = birthDateToIso(draft.birthDate);
    if (!birthDate) {
      setObjects((current) => ({
        ...current,
        error: 'Data de nascimento inválida. Volte e corrija os dados.',
      }));
      return;
    }

    setBooleans((current) => ({ ...current, verifying: true }));
    setObjects((current) => ({ ...current, error: null }));

    try {
      await completeRegistration({
        code: onlyDigits(formValues.code),
        email: draft.email,
        name: draft.name,
        password: draft.password,
        birthDate: `${birthDate}T12:00:00.000Z`,
        phone: draft.phone,
        cep: draft.cep,
        city: draft.city,
        uf: draft.uf,
      });
      clearDraft();
      setBooleans((current) => ({ ...current, showSuccess: true, verifying: false }));
    } catch (err) {
      setBooleans((current) => ({ ...current, verifying: false }));
      setObjects((current) => ({
        ...current,
        error:
          err instanceof ApiError
            ? err.message === 'Invalid or expired verification code'
              ? 'Código inválido ou expirado.'
              : err.message === 'Email already registered'
                ? 'Este e-mail já está cadastrado.'
                : err.message
            : 'Não foi possível verificar o código.',
      }));
    }
  }

  if (!hasCompleteDraft) {
    return null;
  }

  return (
    <PencilScreen keyboardScroll>
      <AuthHeader title="Verificação" onBack={() => router.replace(authRoutes.personalData)} />
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
        editable={!verifying && !showSuccess}
      />
      <Pressable
        onPress={handleResend}
        disabled={sending || verifying || showSuccess}
        style={styles.resendButton}
      >
        <Text style={[styles.resend, (sending || verifying) && styles.resendDisabled]}>
          {sending ? 'Enviando...' : 'Reenviar código'}
        </Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <OtpIllustration />
      <PencilButton
        label={verifying ? 'Verificando...' : 'Verificar'}
        top={738}
        left={20}
        width={350}
        height={58}
        disabled={!canVerify || showSuccess}
        onPress={handleVerify}
      />
      <HomeIndicator top={829} />
      {showSuccess ? (
        <ConfirmationOverlay
          title={`Conta criada\ncom sucesso`}
          message={`Seu cadastro foi realizado, agora você já\npode entrar com sua conta`}
          buttonLabel="IR PARA O APP"
          onPress={() => router.replace('/(protected)')}
        />
      ) : null}
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
