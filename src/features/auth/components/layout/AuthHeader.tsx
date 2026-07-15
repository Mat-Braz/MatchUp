import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { theme } from '@/constants/theme';

type AuthHeaderProps = {
  title: string;
  onBack?: () => void;
};

export function AuthHeader({ title, onBack }: AuthHeaderProps) {
  const router = useRouter();

  function handleBack() {
    if (onBack) {
      onBack();
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }
  }

  return (
    <View style={styles.headerRow}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        hitSlop={10}
        onPress={handleBack}
        style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
      >
        <Ionicons name="chevron-back" size={22} color={theme.colors.primary} />
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    position: 'absolute',
    left: 16,
    top: 28,
    width: 358,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  backButtonPressed: {
    backgroundColor: '#1D2418',
    borderColor: theme.colors.primary,
    opacity: 0.9,
  },
  headerTitle: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: theme.fontWeights.extraBold,
    lineHeight: 24,
  },
});
