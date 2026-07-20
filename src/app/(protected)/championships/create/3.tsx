import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useRouter } from 'expo-router';

import { championshipRoutes } from '@/constants/championshipRoutes';
import { theme } from '@/constants/theme';
import { useChampionshipWizard } from '@/features/championships';
import { ChoiceChip, FieldLabel, PrimaryButton, WizardShell } from '@/features/championships/components/WizardShell';

export default function CreateStep3Screen() {
  const router = useRouter();
  const { draft, updateDraft } = useChampionshipWizard();

  function handleNext() {
    router.push(championshipRoutes.createStep(4) as never);
  }

  return (
    <WizardShell
      title="Premiação"
      step={3}
      footer={<PrimaryButton label="Próximo" onPress={handleNext} />}
    >
      <FieldLabel>Tipos de prêmio</FieldLabel>
      <View style={styles.row}>
        <ChoiceChip
          label="Troféu"
          selected={draft.hasTrophy}
          onPress={() => updateDraft({ hasTrophy: !draft.hasTrophy })}
        />
        <ChoiceChip
          label="Medalha"
          selected={draft.hasMedal}
          onPress={() => updateDraft({ hasMedal: !draft.hasMedal })}
        />
        <ChoiceChip
          label="Dinheiro"
          selected={draft.hasCashPrize}
          onPress={() => updateDraft({ hasCashPrize: !draft.hasCashPrize })}
        />
      </View>

      {draft.hasCashPrize ? (
        <>
          <FieldLabel>1º lugar (R$)</FieldLabel>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            placeholder="0,00"
            placeholderTextColor={theme.colors.textDim}
            value={draft.prizeFirst}
            onChangeText={(prizeFirst) =>
              updateDraft({ prizeFirst: prizeFirst.replace(/[^\d.,]/g, '') })
            }
          />
          <FieldLabel>2º lugar (R$)</FieldLabel>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            placeholder="0,00"
            placeholderTextColor={theme.colors.textDim}
            value={draft.prizeSecond}
            onChangeText={(prizeSecond) =>
              updateDraft({ prizeSecond: prizeSecond.replace(/[^\d.,]/g, '') })
            }
          />
          <FieldLabel>3º lugar (R$)</FieldLabel>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            placeholder="0,00"
            placeholderTextColor={theme.colors.textDim}
            value={draft.prizeThird}
            onChangeText={(prizeThird) =>
              updateDraft({ prizeThird: prizeThird.replace(/[^\d.,]/g, '') })
            }
          />
        </>
      ) : (
        <Text style={styles.hint}>
          Ative “Dinheiro” para informar valores por colocação.
        </Text>
      )}
    </WizardShell>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
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
