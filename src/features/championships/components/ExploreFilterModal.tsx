import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';

import { theme } from '@/constants/theme';
import type { ChampionshipType } from '@/features/championships';

export type ExploreAdvancedFilters = {
  city: string;
  uf: string;
  championshipType: ChampionshipType | null;
};

type ExploreFilterModalProps = {
  visible: boolean;
  initialFilters: ExploreAdvancedFilters;
  onClose: () => void;
  onApply: (filters: ExploreAdvancedFilters) => void;
};

const TYPE_OPTIONS: { value: ChampionshipType | null; label: string }[] = [
  { value: null, label: 'Todos os tipos' },
  { value: 'ELIMINATORIA', label: 'Eliminatória' },
  { value: 'PONTOS_CORRIDOS', label: 'Pontos corridos' },
  { value: 'X1', label: 'X1' },
  { value: 'GRUPOS_MATA_MATA', label: 'Grupos + mata-mata' },
];

export function ExploreFilterModal({
  visible,
  initialFilters,
  onClose,
  onApply,
}: ExploreFilterModalProps) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState(initialFilters);

  useEffect(() => {
    if (visible) {
      setDraft(initialFilters);
    }
  }, [initialFilters, visible]);

  function handleClear() {
    const cleared = { city: '', uf: '', championshipType: null };
    setDraft(cleared);
    onApply(cleared);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Filtros</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Cidade</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex.: São Paulo"
              placeholderTextColor={theme.colors.textDim}
              value={draft.city}
              onChangeText={(city) => setDraft((current) => ({ ...current, city }))}
            />

            <Text style={styles.label}>Estado (UF)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex.: SP"
              placeholderTextColor={theme.colors.textDim}
              autoCapitalize="characters"
              maxLength={2}
              value={draft.uf}
              onChangeText={(uf) =>
                setDraft((current) => ({ ...current, uf: uf.toUpperCase() }))
              }
            />

            <Text style={styles.label}>Tipo de campeonato</Text>
            <View style={styles.typeRow}>
              {TYPE_OPTIONS.map((option) => {
                const active = draft.championshipType === option.value;
                return (
                  <Pressable
                    key={option.label}
                    style={[styles.typeChip, active && styles.typeChipActive]}
                    onPress={() =>
                      setDraft((current) => ({
                        ...current,
                        championshipType: option.value,
                      }))
                    }
                  >
                    <Text
                      style={[styles.typeChipText, active && styles.typeChipTextActive]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <Pressable style={styles.secondaryBtn} onPress={handleClear}>
              <Text style={styles.secondaryBtnText}>Limpar</Text>
            </Pressable>
            <Pressable
              style={styles.primaryBtn}
              onPress={() => {
                onApply(draft);
                onClose();
              }}
            >
              <Text style={styles.primaryBtnText}>Aplicar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  dismissArea: { flex: 1 },
  sheet: {
    maxHeight: '85%',
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: theme.fontWeights.bold,
  },
  body: { gap: 10, paddingBottom: 8 },
  label: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: theme.fontWeights.semibold,
    textTransform: 'uppercase',
    marginTop: 4,
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
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  typeChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  typeChipText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: theme.fontWeights.bold,
  },
  typeChipTextActive: {
    color: theme.colors.black,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: theme.colors.text,
    fontWeight: theme.fontWeights.bold,
  },
  primaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: theme.colors.black,
    fontWeight: theme.fontWeights.extraBold,
  },
});
