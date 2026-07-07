import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui';
import { theme } from '@/constants/theme';

type ConfirmationModalProps = {
  visible: boolean;
  title: string;
  message: string;
  actionLabel?: string;
  onClose: () => void;
};

export function ConfirmationModal({ visible, title, message, actionLabel = 'Continuar', onClose }: ConfirmationModalProps) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card}>
          <View style={styles.mark}>
            <Text style={styles.markText}>✓</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <Button label={actionLabel} onPress={onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000CC',
    padding: theme.spacing.screen,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surfaceLow,
    padding: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  mark: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
  },
  markText: {
    color: theme.colors.black,
    fontSize: 28,
    fontWeight: theme.fontWeights.black,
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: theme.fontWeights.black,
  },
  message: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    fontWeight: theme.fontWeights.semibold,
    lineHeight: 20,
  },
});
