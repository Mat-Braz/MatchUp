import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { championshipRoutes } from '@/constants/championshipRoutes';
import { protectedProfileRoutes } from '@/constants/protectedProfileRoutes';
import { theme } from '@/constants/theme';
import {
  useChampionshipWizard,
} from '@/features/championships';
import { PrimaryButton } from '@/features/championships/components/WizardShell';

export default function CreateSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { resetDraft } = useChampionshipWizard();

  function goToMyChampionships() {
    resetDraft();
    router.replace(protectedProfileRoutes.myChampionships);
  }

  function goHome() {
    resetDraft();
    router.replace('/(protected)/(tabs)/home');
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.iconWrap}>
        <Ionicons name="checkmark-circle" size={72} color={theme.colors.primary} />
      </View>
      <Text style={styles.title}>Campeonato criado com sucesso</Text>
      <Text style={styles.subtitle}>
        Seu torneio já está disponível. Continue gerenciando em Meus Campeonatos.
      </Text>

      <PrimaryButton label="Ir para o campeonato" onPress={goToMyChampionships} />
      <Pressable onPress={goHome} style={styles.linkBtn}>
        <Text style={styles.link}>Ver meus campeonatos / Início</Text>
      </Pressable>
      <Pressable
        onPress={() => router.replace(championshipRoutes.create as never)}
        style={styles.linkBtn}
      >
        <Text style={styles.linkMuted}>Criar outro</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 24,
    justifyContent: 'center',
    gap: 16,
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: theme.fontWeights.extraBold,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  linkBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  link: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeights.bold,
    fontSize: 15,
  },
  linkMuted: {
    color: theme.colors.textDim,
    fontSize: 14,
  },
});
