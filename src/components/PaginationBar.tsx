import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { theme } from '@/constants/theme';

export const PAGINATION_BAR_HEIGHT = 52;

type PaginationBarProps = {
  page: number;
  totalPages: number;
  disabled?: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export function PaginationBar({
  page,
  totalPages,
  disabled = false,
  onPrev,
  onNext,
}: PaginationBarProps) {
  const atStart = page <= 1;
  const atEnd = page >= totalPages;

  return (
    <View style={styles.bar}>
      <Pressable
        style={[styles.pageBtn, (atStart || disabled) && styles.pageBtnDisabled]}
        disabled={atStart || disabled}
        onPress={onPrev}
      >
        <Ionicons name="chevron-back" size={18} color={theme.colors.text} />
      </Pressable>
      <Text style={styles.pageLabel}>
        Página {page} de {totalPages}
      </Text>
      <Pressable
        style={[styles.pageBtn, (atEnd || disabled) && styles.pageBtnDisabled]}
        disabled={atEnd || disabled}
        onPress={onNext}
      >
        <Ionicons name="chevron-forward" size={18} color={theme.colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: PAGINATION_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
  },
  pageBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceHigh,
  },
  pageBtnDisabled: {
    opacity: 0.35,
  },
  pageLabel: {
    color: theme.colors.text,
    fontWeight: theme.fontWeights.bold,
    fontSize: 13,
  },
});
