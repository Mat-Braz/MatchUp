import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';

import { championshipRoutes } from '@/constants/championshipRoutes';
import { theme } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import {
  fetchChampionship,
  useChampionshipWizard,
} from '@/features/championships';
import {
  ChoiceChip,
  FieldLabel,
  PrimaryButton,
  WizardShell,
} from '@/features/championships/components/WizardShell';
import { ApiError } from '@/lib/api/graphql';

export default function CreateStep1Screen() {
  const router = useRouter();
  const { token } = useAuth();
  const params = useLocalSearchParams<{ championshipId?: string }>();
  const { draft, updateDraft, loadFromChampionship, editingChampionshipId, resetDraft } =
    useChampionshipWizard();
  const [error, setError] = useState<string | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const parsedId = params.championshipId ? Number(params.championshipId) : NaN;
  const editId = Number.isFinite(parsedId) && parsedId > 0 ? parsedId : null;

  useEffect(() => {
    if (!editId && editingChampionshipId != null) {
      resetDraft();
    }
  }, [editId, editingChampionshipId, resetDraft]);

  useEffect(() => {
    if (!token || !editId || editingChampionshipId === editId) {
      return;
    }
    let cancelled = false;
    setLoadingEdit(true);
    void (async () => {
      try {
        const championship = await fetchChampionship(token, editId);
        if (!cancelled) {
          loadFromChampionship(championship);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Não foi possível carregar o campeonato.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingEdit(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editId, editingChampionshipId, loadFromChampionship, token]);

  function handleNext() {
    if (draft.name.trim().length < 2) {
      setError('Informe o nome do campeonato.');
      return;
    }
    if (!draft.city.trim() || draft.uf.trim().length !== 2) {
      setError('Informe cidade e UF.');
      return;
    }
    setError(null);
    router.push(championshipRoutes.createStep(2) as never);
  }

  if (loadingEdit) {
    return (
      <WizardShell title="Dados básicos" step={1}>
        <ActivityIndicator color={theme.colors.primary} />
      </WizardShell>
    );
  }

  return (
    <WizardShell
      title={editingChampionshipId ? 'Editar dados' : 'Dados básicos'}
      step={1}
      footer={<PrimaryButton label="Próximo" onPress={handleNext} />}
    >
      <FieldLabel>Nome do campeonato</FieldLabel>
      <TextInput
        style={styles.input}
        placeholder="Ex: Copa MatchUp"
        placeholderTextColor={theme.colors.textDim}
        value={draft.name}
        onChangeText={(name) => updateDraft({ name })}
      />

      <FieldLabel>Descrição</FieldLabel>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Conte um pouco sobre o torneio"
        placeholderTextColor={theme.colors.textDim}
        value={draft.description}
        onChangeText={(description) => updateDraft({ description })}
        multiline
      />

      <FieldLabel>Cidade</FieldLabel>
      <TextInput
        style={styles.input}
        placeholder="Sua cidade"
        placeholderTextColor={theme.colors.textDim}
        value={draft.city}
        onChangeText={(city) => updateDraft({ city })}
      />

      <FieldLabel>Estado (UF)</FieldLabel>
      <TextInput
        style={styles.input}
        placeholder="SP"
        placeholderTextColor={theme.colors.textDim}
        autoCapitalize="characters"
        maxLength={2}
        value={draft.uf}
        onChangeText={(uf) => updateDraft({ uf: uf.toUpperCase() })}
      />

      <FieldLabel>Visibilidade</FieldLabel>
      <View style={styles.row}>
        <ChoiceChip
          label="Público"
          selected={draft.isPublic}
          onPress={() => updateDraft({ isPublic: true })}
        />
        <ChoiceChip
          label="Privado"
          selected={!draft.isPublic}
          onPress={() => updateDraft({ isPublic: false })}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </WizardShell>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.colors.text,
    fontSize: 15,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  error: {
    color: theme.colors.dangerSoft,
    fontSize: 13,
    fontWeight: theme.fontWeights.semibold,
  },
});
