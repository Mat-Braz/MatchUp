import { useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

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
  useRegister,
} from '@/features/auth';
import { lookupCep } from '@/lib/api/viacep';
import { formatBirthDate, formatCep, formatPhone, onlyDigits } from '@/lib/masks';

export default function PersonalDataScreen() {
  const router = useRouter();
  const { draft, setPersonalData } = useRegister();
  const lastLookupCep = useRef<string | null>(onlyDigits(draft.cep) || null);

  const [objects, setObjects] = useState({
    formValues: {
      birthDate: draft.birthDate,
      phone: draft.phone,
      cep: draft.cep,
      city: draft.city,
      uf: draft.uf,
    },
    error: null as string | null,
  });
  const [booleans, setBooleans] = useState({
    lookingUpCep: false,
  });

  const { formValues, error } = objects;
  const { lookingUpCep } = booleans;

  const canContinue =
    onlyDigits(formValues.birthDate).length === 8 &&
    onlyDigits(formValues.phone).length >= 10 &&
    onlyDigits(formValues.cep).length === 8 &&
    formValues.city.trim().length > 0 &&
    formValues.uf.trim().length === 2;

  function updateFormValue(field: keyof typeof formValues, value: string) {
    setObjects((current) => ({
      ...current,
      error: null,
      formValues: { ...current.formValues, [field]: value },
    }));
  }

  function handleBirthDateChange(value: string) {
    updateFormValue('birthDate', formatBirthDate(value));
  }

  function handlePhoneChange(value: string) {
    updateFormValue('phone', formatPhone(value));
  }

  async function handleCepChange(rawCep: string) {
    const formatted = formatCep(rawCep);
    const digits = onlyDigits(formatted);

    setObjects((current) => ({
      ...current,
      error: null,
      formValues: {
        ...current.formValues,
        cep: formatted,
        ...(digits.length < 8 ? { city: '', uf: '' } : null),
      },
    }));

    if (digits.length !== 8 || digits === lastLookupCep.current || lookingUpCep) {
      return;
    }

    lastLookupCep.current = digits;
    setBooleans((current) => ({ ...current, lookingUpCep: true }));

    try {
      const address = await lookupCep(digits);
      setObjects((current) => ({
        ...current,
        error: null,
        formValues: {
          ...current.formValues,
          cep: address.cep,
          city: address.city,
          uf: address.uf,
        },
      }));
    } catch (err) {
      lastLookupCep.current = null;
      setObjects((current) => ({
        ...current,
        error: err instanceof Error ? err.message : 'CEP não encontrado.',
        formValues: {
          ...current.formValues,
          city: '',
          uf: '',
        },
      }));
    } finally {
      setBooleans((current) => ({ ...current, lookingUpCep: false }));
    }
  }

  function handleCreateAccount() {
    if (!canContinue) {
      setObjects((current) => ({
        ...current,
        error: 'Preencha todos os campos para continuar.',
      }));
      return;
    }

    setPersonalData({
      birthDate: formValues.birthDate,
      phone: formValues.phone,
      cep: formValues.cep,
      city: formValues.city,
      uf: formValues.uf,
    });
    router.push(authRoutes.verifyCode);
  }

  return (
    <PencilScreen keyboardScroll>
      <AuthTitle
        title="Dados pessoais"
        subtitle="Complete seu perfil para participar dos campeonatos"
      />
      <Progress current={3} />
      <PencilField
        label="DATA DE NASCIMENTO"
        placeholder="00/00/0000"
        top={192}
        keyboardType="number-pad"
        value={formValues.birthDate}
        onChangeText={handleBirthDateChange}
      />
      <PencilField
        label="TELEFONE"
        placeholder="(00) 00000-0000"
        top={286}
        keyboardType="phone-pad"
        value={formValues.phone}
        onChangeText={handlePhoneChange}
      />
      <PencilField
        label="CEP"
        placeholder="00000-000"
        top={380}
        keyboardType="number-pad"
        value={formValues.cep}
        onChangeText={handleCepChange}
        editable={!lookingUpCep}
      />
      <PencilField
        label="CIDADE"
        placeholder={lookingUpCep ? 'Buscando...' : 'Sua cidade'}
        top={474}
        value={formValues.city}
        onChangeText={(city) => updateFormValue('city', city)}
        editable={!lookingUpCep}
      />
      <PencilField
        label="ESTADO"
        placeholder="UF"
        top={568}
        autoCapitalize="characters"
        value={formValues.uf}
        onChangeText={(uf) => updateFormValue('uf', uf.toUpperCase().slice(0, 2))}
        editable={!lookingUpCep}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PencilButton
        label="Criar conta"
        top={683}
        disabled={!canContinue || lookingUpCep}
        onPress={handleCreateAccount}
      />
      <HomeIndicator top={829} />
    </PencilScreen>
  );
}

const styles = StyleSheet.create({
  error: {
    position: 'absolute',
    left: 24,
    top: 650,
    width: 342,
    color: theme.colors.dangerSoft,
    fontSize: 13,
    fontWeight: theme.fontWeights.semibold,
  },
});
