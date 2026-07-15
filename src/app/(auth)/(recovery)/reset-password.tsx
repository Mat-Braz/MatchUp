import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { authRoutes } from '@/constants/authRoutes';
import { theme } from '@/constants/theme';
import {
  AuthHeader,
  ConfirmationOverlay,
  HomeIndicator,
  PencilButton,
  PencilField,
  PencilScreen,
  SecurityCard,
  meetsPasswordRequirements,
  resetPasswordRequest,
  useRecovery,
} from '@/features/auth';
import { ApiError } from '@/lib/api/graphql';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { draft, hasCode, clearDraft } = useRecovery();

  const [objects, setObjects] = useState({
    formValues: {
      password: '',
      confirmPassword: '',
    },
    error: null as string | null,
  });
  const [booleans, setBooleans] = useState({
    passVisible: false,
    confirmPassVisible: false,
    submitting: false,
    showSuccess: false,
  });

  const { formValues, error } = objects;
  const { passVisible, confirmPassVisible, submitting, showSuccess } = booleans;

  const canSubmit =
    formValues.password.length > 0 &&
    formValues.confirmPassword.length > 0 &&
    !submitting &&
    !showSuccess;

  useEffect(() => {
    if (!hasCode && !showSuccess) {
      router.replace(authRoutes.forgotPassword);
    }
  }, [hasCode, showSuccess, router]);

  function updateFormValue(field: keyof typeof formValues, value: string) {
    setObjects((current) => ({
      ...current,
      error: null,
      formValues: { ...current.formValues, [field]: value },
    }));
  }

  async function handleReset() {
    if (!canSubmit) {
      setObjects((current) => ({
        ...current,
        error: 'Preencha os campos de senha.',
      }));
      return;
    }

    if (formValues.password !== formValues.confirmPassword) {
      setObjects((current) => ({
        ...current,
        error: 'As senhas não coincidem.',
      }));
      return;
    }

    if (!meetsPasswordRequirements(formValues.password)) {
      setObjects((current) => ({
        ...current,
        error: 'A senha precisa atender aos requisitos de segurança.',
      }));
      return;
    }

    setBooleans((current) => ({ ...current, submitting: true }));
    setObjects((current) => ({ ...current, error: null }));

    try {
      await resetPasswordRequest({
        email: draft.email,
        code: draft.code,
        password: formValues.password,
      });
      setBooleans((current) => ({
        ...current,
        submitting: false,
        showSuccess: true,
      }));
    } catch (err) {
      setBooleans((current) => ({ ...current, submitting: false }));
      setObjects((current) => ({
        ...current,
        error:
          err instanceof ApiError
            ? err.message === 'Invalid or expired verification code'
              ? 'Código inválido ou expirado. Solicite um novo.'
              : err.message === 'Email not registered'
                ? 'Não encontramos uma conta com este e-mail.'
                : err.message
            : 'Não foi possível redefinir a senha.',
      }));
    }
  }

  if (!hasCode && !showSuccess) {
    return null;
  }

  return (
    <PencilScreen scroll>
      <AuthHeader
        title="Redefinir senha"
        onBack={() => router.replace(authRoutes.verifyRecoveryCode)}
      />
      <Text style={styles.intro}>Crie uma nova senha para acessar sua conta.</Text>
      <PencilField
        label="NOVA SENHA"
        placeholder="••••••••"
        secure={!passVisible}
        top={204}
        left={20}
        width={350}
        textContentType="newPassword"
        value={formValues.password}
        onChangeText={(password) => updateFormValue('password', password)}
        icon={<Ionicons name={passVisible ? 'eye-off-outline' : 'eye-outline'} size={20} />}
        onIconPress={() =>
          setBooleans((current) => ({ ...current, passVisible: !current.passVisible }))
        }
      />
      <PencilField
        label="CONFIRMAR NOVA SENHA"
        placeholder="••••••••"
        secure={!confirmPassVisible}
        top={326}
        left={20}
        width={350}
        textContentType="newPassword"
        value={formValues.confirmPassword}
        onChangeText={(confirmPassword) => updateFormValue('confirmPassword', confirmPassword)}
        icon={
          <Ionicons name={confirmPassVisible ? 'eye-off-outline' : 'eye-outline'} size={20} />
        }
        onIconPress={() =>
          setBooleans((current) => ({
            ...current,
            confirmPassVisible: !current.confirmPassVisible,
          }))
        }
      />
      <SecurityCard password={formValues.password} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PencilButton
        label={submitting ? 'Redefinindo...' : 'Redefinir senha'}
        top={754}
        left={20}
        width={350}
        height={58}
        disabled={!canSubmit}
        onPress={handleReset}
      />
      <HomeIndicator />
      {showSuccess ? (
        <ConfirmationOverlay
          title={`Senha alterada com\nsucesso`}
          message={`Sua senha foi alterada, agora você já\npode entrar com ela`}
          buttonLabel="VOLTAR AO LOGIN"
          onPress={() => {
            clearDraft();
            router.replace(authRoutes.login);
          }}
        />
      ) : null}
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
  error: {
    position: 'absolute',
    left: 20,
    top: 650,
    width: 350,
    color: theme.colors.dangerSoft,
    fontSize: 13,
    fontWeight: theme.fontWeights.semibold,
    textAlign: 'center',
  },
});
