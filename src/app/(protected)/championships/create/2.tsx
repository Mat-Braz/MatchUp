import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useRouter } from 'expo-router';

import { championshipRoutes } from '@/constants/championshipRoutes';
import { theme } from '@/constants/theme';
import type { ChampionshipType } from '@/features/championships';
import { useChampionshipWizard } from '@/features/championships';
import {
  ChoiceChip,
  FieldLabel,
  FormatCard,
  PrimaryButton,
  WizardShell,
} from '@/features/championships/components/WizardShell';

const FORMATS: {
  type: ChampionshipType;
  title: string;
  subtitle: string;
}[] = [
  {
    type: 'ELIMINATORIA',
    title: 'Mata-mata',
    subtitle: 'Eliminatórias diretas',
  },
  {
    type: 'PONTOS_CORRIDOS',
    title: 'Pontos corridos',
    subtitle: 'Todos contra todos',
  },
  {
    type: 'GRUPOS_MATA_MATA',
    title: 'Grupos + Mata-mata',
    subtitle: 'Fase de grupos e eliminatórias',
  },
];

const PARTICIPANT_OPTIONS = [4, 8, 16, 32];

export default function CreateStep2Screen() {
  const router = useRouter();
  const { draft, updateDraft } = useChampionshipWizard();
  const [error, setError] = useState<string | null>(null);

  function handleNext() {
    if (!draft.championshipType) {
      setError('Selecione o formato do campeonato.');
      return;
    }
    setError(null);
    router.push(championshipRoutes.createStep(3) as never);
  }

  return (
    <WizardShell
      title="Formato"
      step={2}
      footer={<PrimaryButton label="Próximo" onPress={handleNext} />}
    >
      <FieldLabel>Tipo de campeonato</FieldLabel>
      {FORMATS.map((item) => (
        <FormatCard
          key={item.type}
          title={item.title}
          subtitle={item.subtitle}
          selected={draft.championshipType === item.type}
          onPress={() => updateDraft({ championshipType: item.type })}
        />
      ))}

      <FieldLabel>Total de participantes</FieldLabel>
      <View style={styles.row}>
        {PARTICIPANT_OPTIONS.map((value) => (
          <ChoiceChip
            key={value}
            label={String(value)}
            selected={draft.maxParticipants === value}
            onPress={() => updateDraft({ maxParticipants: value })}
          />
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </WizardShell>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  error: {
    color: theme.colors.dangerSoft,
    fontSize: 13,
    fontWeight: theme.fontWeights.semibold,
  },
});
