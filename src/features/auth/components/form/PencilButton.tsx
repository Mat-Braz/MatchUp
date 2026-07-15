import { Pressable, StyleSheet, Text } from 'react-native';

import { theme } from '@/constants/theme';

export function PencilButton({
  label,
  top,
  onPress,
  left = 24,
  width = 342,
  height = 56,
  disabled = false,
}: {
  label: string;
  top?: number;
  onPress?: () => void;
  left?: number;
  width?: number | `${number}%`;
  height?: number;
  disabled?: boolean;
}) {
  const positioned = top !== undefined;

  return (
    <Pressable
      disabled={disabled}
      style={[
        styles.button,
        positioned ? { left, top, width, height } : [styles.buttonFlow, { width: '100%', height }],
        disabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
    >
      <Text style={styles.buttonLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
  },
  buttonFlow: {
    position: 'relative',
    alignSelf: 'stretch',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonLabel: {
    color: theme.colors.black,
    fontSize: 16,
    fontWeight: theme.fontWeights.extraBold,
  },
});
