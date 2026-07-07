import { PropsWithChildren } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

import { theme } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

type ButtonProps = PropsWithChildren<{
  label?: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}>;

export function Button({ children, label, variant = 'primary', disabled = false, onPress, style }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {children ?? <Text style={[styles.label, styles[`${variant}Label`]]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.button,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  primary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.surfaceHigh,
    borderColor: theme.colors.border,
  },
  danger: {
    backgroundColor: theme.colors.dangerDark,
    borderColor: theme.colors.danger,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.78,
  },
  label: {
    fontSize: theme.typography.body,
    fontWeight: theme.fontWeights.black,
    lineHeight: 19,
  },
  primaryLabel: {
    color: theme.colors.black,
  },
  secondaryLabel: {
    color: theme.colors.text,
  },
  dangerLabel: {
    color: theme.colors.dangerSoft,
  },
});
