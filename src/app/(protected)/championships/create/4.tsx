import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { useRouter } from 'expo-router';

import { championshipRoutes } from '@/constants/championshipRoutes';
import { theme } from '@/constants/theme';
import { useChampionshipWizard } from '@/features/championships';
import {
  FieldLabel,
  PrimaryButton,
  WizardShell,
} from '@/features/championships/components/WizardShell';
import { onlyDigits } from '@/lib/masks';

export default function CreateStep4Screen() {
  const router = useRouter();
  const { draft, updateDraft } = useChampionshipWizard();

  function handleNext() {
    router.push(championshipRoutes.createStep(5) as never);
  }

  return (
    <WizardShell
      title="Regras"
      step={4}
      footer={<PrimaryButton label="Próximo" onPress={handleNext} />}
    >
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Regras do campeonato</Text>
        <Switch
          value={draft.rulesEnabled}
          onValueChange={(rulesEnabled) => updateDraft({ rulesEnabled })}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor={theme.colors.text}
        />
      </View>

      {draft.rulesEnabled ? (
        <>
          <FieldLabel>Cartão amarelo (limite)</FieldLabel>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={draft.yellowCardLimit}
            onChangeText={(yellowCardLimit) =>
              updateDraft({ yellowCardLimit: onlyDigits(yellowCardLimit).slice(0, 2) })
            }
          />
          <FieldLabel>Cartão vermelho (limite)</FieldLabel>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={draft.redCardLimit}
            onChangeText={(redCardLimit) =>
              updateDraft({ redCardLimit: onlyDigits(redCardLimit).slice(0, 2) })
            }
          />
          <FieldLabel>Substituições</FieldLabel>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={draft.substitutions}
            onChangeText={(substitutions) =>
              updateDraft({ substitutions: onlyDigits(substitutions).slice(0, 2) })
            }
          />
        </>
      ) : (
        <Text style={styles.hint}>Ative as regras para configurar cartões e substituições.</Text>
      )}
    </WizardShell>
  );
}

const styles = StyleSheet.create({
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  switchLabel: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: theme.fontWeights.semibold,
  },
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
  hint: {
    color: theme.colors.textDim,
    fontSize: 13,
  },
});
