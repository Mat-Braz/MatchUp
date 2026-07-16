import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import { PencilButton } from '../form/PencilButton';

export function ConfirmationOverlay({
  title,
  message,
  buttonLabel,
  onPress,
  variant = 'success',
  icon,
  cancelLabel,
  onCancel,
}: {
  title: string;
  message: string;
  buttonLabel: string;
  onPress?: () => void;
  variant?: 'success' | 'danger';
  icon?: ReactNode;
  cancelLabel?: string;
  onCancel?: () => void;
}) {
  const isDanger = variant === 'danger';
  const hasCancel = Boolean(cancelLabel);

  return (
    <>
      {onCancel ? (
        <Pressable
          accessibilityRole="button"
          onPress={onCancel}
          style={styles.modalDim}
        />
      ) : (
        <View style={styles.modalDim} />
      )}
      <View style={[styles.confirmationCard, hasCancel && styles.confirmationCardTall]}>
        <View
          style={[
            styles.confirmationIconBall,
            isDanger && styles.confirmationIconBallDanger,
          ]}
        >
          {icon ?? (
            <Text
              style={[
                styles.confirmationIcon,
                isDanger && styles.confirmationIconDanger,
              ]}
            >
              {isDanger ? '!' : '✓'}
            </Text>
          )}
        </View>
        <Text style={styles.confirmationTitle}>{title}</Text>
        <Text style={styles.confirmationMessage}>{message}</Text>
        <PencilButton
          label={buttonLabel}
          top={hasCancel ? 250 : 262}
          left={24}
          width={294}
          height={58}
          tone={isDanger ? 'danger' : 'primary'}
          onPress={onPress}
        />
        {hasCancel ? (
          <Pressable
            accessibilityRole="button"
            onPress={onCancel}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelLabel}>{cancelLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  modalDim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#00000099',
    zIndex: 40,
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
    zIndex: 41,
  },
  confirmationCardTall: {
    height: 392,
  },
  confirmationIconBall: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 29,
    backgroundColor: theme.colors.primary,
  },
  confirmationIconBallDanger: {
    backgroundColor: theme.colors.danger,
  },
  confirmationIcon: {
    color: theme.colors.black,
    fontSize: 34,
    fontWeight: theme.fontWeights.extraBold,
  },
  confirmationIconDanger: {
    color: '#FFFFFF',
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
  cancelButton: {
    position: 'absolute',
    left: 24,
    top: 324,
    width: 294,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelLabel: {
    color: theme.colors.textMuted,
    fontSize: 15,
    fontWeight: theme.fontWeights.bold,
  },
});
