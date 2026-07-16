import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { theme } from '@/constants/theme';
import {
  AuthHeader,
  ConfirmationOverlay,
  HomeIndicator,
  PencilButton,
  PencilField,
  PencilScreen,
  useAuth,
} from '@/features/auth';
import {
  fetchMe,
  isoToBirthDateDisplay,
  updateMyProfile,
} from '@/features/profile';
import { ApiError } from '@/lib/api/graphql';
import { birthDateToIso, formatBirthDate, formatPhone, onlyDigits } from '@/lib/masks';

export default function EditProfileScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const [objects, setObjects] = useState({
    formValues: {
      name: '',
      birthDate: '',
      phone: '',
      city: '',
      uf: '',
    },
    error: null as string | null,
  });
  const [booleans, setBooleans] = useState({
    loading: true,
    saving: false,
    showSuccess: false,
  });

  const { formValues, error } = objects;
  const { loading, saving, showSuccess } = booleans;

  const loadProfile = useCallback(async () => {
    if (!token) {
      setBooleans((current) => ({ ...current, loading: false, saving: false }));
      return;
    }

    setBooleans((current) => ({ ...current, loading: true }));
    setObjects((current) => ({ ...current, error: null }));

    try {
      const me = await fetchMe(token);
      setObjects({
        formValues: {
          name: me.name ?? '',
          birthDate: isoToBirthDateDisplay(me.birthDate),
          phone: me.phone ? formatPhone(me.phone) : '',
          city: me.city ?? '',
          uf: me.uf ?? '',
        },
        error: null,
      });
    } catch (err) {
      setObjects((current) => ({
        ...current,
        error:
          err instanceof ApiError
            ? err.message
            : 'Não foi possível carregar seus dados.',
      }));
    } finally {
      setBooleans((current) => ({ ...current, loading: false }));
    }
  }, [token]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  function updateFormValue(field: keyof typeof formValues, value: string) {
    setObjects((current) => ({
      ...current,
      error: null,
      formValues: { ...current.formValues, [field]: value },
    }));
  }

  async function handleSave() {
    if (!token || saving) {
      return;
    }

    const name = formValues.name.trim();
    if (name.length < 2) {
      setObjects((current) => ({
        ...current,
        error: 'Informe um nome válido.',
      }));
      return;
    }

    const birthIso = birthDateToIso(formValues.birthDate);
    if (formValues.birthDate && !birthIso) {
      setObjects((current) => ({
        ...current,
        error: 'Data de nascimento inválida.',
      }));
      return;
    }

    const phoneDigits = onlyDigits(formValues.phone);
    if (formValues.phone && phoneDigits.length < 10) {
      setObjects((current) => ({
        ...current,
        error: 'Telefone inválido.',
      }));
      return;
    }

    const uf = formValues.uf.trim().toUpperCase();
    if (uf && uf.length !== 2) {
      setObjects((current) => ({
        ...current,
        error: 'UF deve ter 2 letras.',
      }));
      return;
    }

    setBooleans((current) => ({ ...current, saving: true }));
    setObjects((current) => ({ ...current, error: null }));

    try {
      await updateMyProfile(token, {
        name,
        birthDate: birthIso ? `${birthIso}T12:00:00.000Z` : null,
        phone: formValues.phone.trim() || null,
        city: formValues.city.trim() || null,
        uf: uf || null,
      });
      setBooleans((current) => ({
        ...current,
        saving: false,
        showSuccess: true,
      }));
    } catch (err) {
      setObjects((current) => ({
        ...current,
        error:
          err instanceof ApiError
            ? err.message
            : 'Não foi possível salvar as alterações.',
      }));
      setBooleans((current) => ({ ...current, saving: false }));
    }
  }

  return (
    <PencilScreen scroll canvasHeight={900}>
      <AuthHeader title="Editar Perfil" onBack={() => router.back()} />
      <Text style={styles.subtitle}>
        Atualize seus dados pessoais e informações públicas.
      </Text>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : (
        <>
          <PencilField
            label="NOME COMPLETO"
            placeholder="Seu nome"
            top={132}
            left={20}
            width={350}
            iconSide="left"
            value={formValues.name}
            onChangeText={(name) => updateFormValue('name', name)}
            icon={<Ionicons name="person-outline" size={18} />}
          />
          <PencilField
            label="DATA DE NASCIMENTO"
            placeholder="00/00/0000"
            top={230}
            left={20}
            width={350}
            iconSide="left"
            keyboardType="number-pad"
            value={formValues.birthDate}
            onChangeText={(value) => updateFormValue('birthDate', formatBirthDate(value))}
            icon={<Ionicons name="calendar-outline" size={18} />}
          />
          <PencilField
            label="TELEFONE"
            placeholder="(00) 00000-0000"
            top={328}
            left={20}
            width={350}
            iconSide="left"
            keyboardType="phone-pad"
            value={formValues.phone}
            onChangeText={(value) => updateFormValue('phone', formatPhone(value))}
            icon={<Ionicons name="call-outline" size={18} />}
          />
          <PencilField
            label="CIDADE"
            placeholder="Sua cidade"
            top={426}
            left={20}
            width={350}
            iconSide="left"
            value={formValues.city}
            onChangeText={(city) => updateFormValue('city', city)}
            icon={<Ionicons name="location-outline" size={18} />}
          />
          <PencilField
            label="ESTADO"
            placeholder="UF"
            top={524}
            left={20}
            width={350}
            iconSide="left"
            autoCapitalize="characters"
            value={formValues.uf}
            onChangeText={(uf) => updateFormValue('uf', uf.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase())}
            icon={<Ionicons name="map-outline" size={18} />}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PencilButton
            label={saving ? 'Salvando...' : 'Salvar alterações'}
            top={680}
            left={20}
            width={350}
            height={56}
            disabled={saving || showSuccess}
            onPress={handleSave}
          />
          <HomeIndicator top={820} />
        </>
      )}

      {showSuccess ? (
        <ConfirmationOverlay
          title={`Perfil atualizado\ncom sucesso`}
          message={`Seus dados pessoais foram salvos\ne já estão visíveis no app.`}
          buttonLabel="VOLTAR AO PERFIL"
          onPress={() => router.back()}
        />
      ) : null}
    </PencilScreen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    position: 'absolute',
    left: 20,
    top: 84,
    width: 350,
    color: '#A6A5B0',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  loadingBox: {
    position: 'absolute',
    left: 20,
    top: 220,
    width: 350,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    position: 'absolute',
    left: 20,
    top: 630,
    width: 350,
    color: theme.colors.dangerSoft,
    fontSize: 13,
    fontWeight: theme.fontWeights.semibold,
    textAlign: 'center',
  },
});
