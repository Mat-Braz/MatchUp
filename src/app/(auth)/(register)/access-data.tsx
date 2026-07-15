import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { authRoutes } from '@/constants/authRoutes';
import { theme } from '@/constants/theme';
import {
  AuthTitle,
  HomeIndicator,
  PencilButton,
  PencilField,
  PencilScreen,
  Progress,
  SecurityCard,
  isEmailAvailableRequest,
  useRegister,
} from '@/features/auth';
import { ApiError } from '@/lib/api/graphql';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AccessDataScreen() {
  const router = useRouter();
  const { draft, setAccessData } = useRegister();

  const [objects, setObjects] = useState({
    formValues: {
      name: draft.name,
      email: draft.email,
      password: draft.password,
      confirmPassword: draft.password,
    },
    error: null as string | null,
  });
  const [booleans, setBooleans] = useState({
    showSecurity: Boolean(draft.password),
    passVisible: false,
    confirmPassVisible: false,
    checkingEmail: false,
  });

  const { formValues, error } = objects;
  const { showSecurity, passVisible, confirmPassVisible, checkingEmail } = booleans;

  const canContinue =
    formValues.name.trim().length > 0 &&
    formValues.email.trim().length > 0 &&
    formValues.password.length > 0 &&
    formValues.confirmPassword.length > 0 &&
    !checkingEmail;

  function updateFormValue(field: keyof typeof formValues, value: string) {
    setObjects((current) => ({
      ...current,
      error: null,
      formValues: { ...current.formValues, [field]: value },
    }));
  }

  async function handleContinue() {
    if (!canContinue) {
      setObjects((current) => ({
        ...current,
        error: 'Preencha todos os campos para continuar.',
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

    if (formValues.password !== formValues.confirmPassword) {
      setObjects((current) => ({
        ...current,
        error: 'As senhas não coincidem.',
      }));
      return;
    }

    if (formValues.password.length < 8) {
      setObjects((current) => ({
        ...current,
        error: 'A senha precisa ter no mínimo 8 caracteres.',
      }));
      return;
    }

    setBooleans((current) => ({ ...current, checkingEmail: true }));
    setObjects((current) => ({ ...current, error: null }));

    try {
      const available = await isEmailAvailableRequest(normalizedEmail);
      if (!available) {
        setObjects((current) => ({
          ...current,
          error: 'Este e-mail já está cadastrado. Faça login ou use outro e-mail.',
        }));
        return;
      }

      setAccessData({
        name: formValues.name,
        email: normalizedEmail,
        password: formValues.password,
      });
      router.push(authRoutes.personalData);
    } catch (err) {
      setObjects((current) => ({
        ...current,
        error:
          err instanceof ApiError
            ? err.message
            : 'Não foi possível validar o e-mail. Tente novamente.',
      }));
    } finally {
      setBooleans((current) => ({ ...current, checkingEmail: false }));
    }
  }

  return (
    <PencilScreen scroll>
      <AuthTitle title="Dados de acesso" subtitle="Crie sua conta de pessoa ou atleta" />
      <Progress current={2} />
      <PencilField
        label="NOME COMPLETO"
        placeholder="Digite seu nome"
        top={183}
        value={formValues.name}
        onChangeText={(name) => updateFormValue('name', name)}
      />
      <PencilField
        label="E-MAIL"
        placeholder="exemplo@email.com"
        top={277}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="emailAddress"
        value={formValues.email}
        onChangeText={(email) => updateFormValue('email', email)}
      />
      <PencilField
        label="SENHA"
        placeholder="Min. 8 caracteres"
        secure={!passVisible}
        top={371}
        textContentType="newPassword"
        value={formValues.password}
        onChangeText={(password) => updateFormValue('password', password)}
        onFocus={() => setBooleans((current) => ({ ...current, showSecurity: true }))}
        icon={<Ionicons name={passVisible ? 'eye-off-outline' : 'eye-outline'} size={20} />}
        onIconPress={() =>
          setBooleans((current) => ({ ...current, passVisible: !current.passVisible }))
        }
      />
      {showSecurity ? <SecurityCard compact top={455} password={formValues.password} /> : null}
      <PencilField
        label="CONFIRMAR SENHA"
        placeholder="Repita sua senha"
        secure={!confirmPassVisible}
        top={showSecurity ? 562 : 465}
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
      {error ? <Text style={[styles.error, { top: showSecurity ? 652 : 555 }]}>{error}</Text> : null}
      <PencilButton
        label={checkingEmail ? 'Validando e-mail...' : 'Continuar'}
        top={686}
        disabled={!canContinue}
        onPress={handleContinue}
      />
      <HomeIndicator top={829} />
    </PencilScreen>
  );
}

const styles = StyleSheet.create({
  error: {
    position: 'absolute',
    left: 24,
    width: 342,
    color: theme.colors.dangerSoft,
    fontSize: 13,
    fontWeight: theme.fontWeights.semibold,
  },
});
