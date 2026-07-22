import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { teamRoutes } from '@/constants/teamRoutes';
import { theme } from '@/constants/theme';
import { TeamEditor } from '@/features/teams';

export default function TeamFormScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ teamId?: string }>();

  const parsedId = params.teamId ? Number(params.teamId) : NaN;
  const teamId = Number.isFinite(parsedId) && parsedId > 0 ? parsedId : null;
  const isEdit = teamId != null;

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(teamRoutes.tab as never);
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>{isEdit ? 'Time' : 'Criar time'}</Text>
          <Text style={styles.subtitle}>
            {isEdit
              ? 'Dados, convites e formação'
              : 'Tudo opcional depois do nome'}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingBottom: Math.max(insets.bottom, 24) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TeamEditor
          key={teamId ?? 'new'}
          teamId={teamId}
          variant="screen"
          onDone={goBack}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: theme.fontWeights.bold,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  body: {
    paddingHorizontal: 20,
    gap: 14,
  },
});
