import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import { PencilButton } from '../form/PencilButton';

export function ConfirmationOverlay({
  title,
  message,
  buttonLabel,
  onPress,
}: {
  title: string;
  message: string;
  buttonLabel: string;
  onPress?: () => void;
}) {
  return (
    <>
      <View style={styles.modalDim} />
      <View style={styles.confirmationCard}>
        <View style={styles.confirmationIconBall}>
          <Text style={styles.confirmationIcon}>✓</Text>
        </View>
        <Text style={styles.confirmationTitle}>{title}</Text>
        <Text style={styles.confirmationMessage}>{message}</Text>
        <PencilButton
          label={buttonLabel}
          top={262}
          left={24}
          width={294}
          height={58}
          onPress={onPress}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  modalDim: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 390,
    height: 844,
    backgroundColor: '#00000099',
  },
  confirmationCard: {
    position: 'absolute',
    left: 24,
    top: 250,
    width: 342,
    height: 344,
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surfaceCard,
    padding: 24,
    gap: 20,
  },
  confirmationIconBall: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 29,
    backgroundColor: theme.colors.primary,
  },
  confirmationIcon: {
    color: theme.colors.black,
    fontSize: 34,
    fontWeight: theme.fontWeights.extraBold,
  },
  confirmationTitle: {
    width: 294,
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: theme.fontWeights.extraBold,
    lineHeight: 33,
    textAlign: 'center',
  },
  confirmationMessage: {
    width: 311,
    color: '#C5C4CC',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
    textAlign: 'center',
  },
});
