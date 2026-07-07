import { TextInput, TextInputProps, StyleSheet, View } from 'react-native';

import { theme } from '@/constants/theme';

type TextFieldProps = TextInputProps & {
  active?: boolean;
};

export function TextField({ active = false, placeholderTextColor = theme.colors.textDim, style, ...props }: TextFieldProps) {
  return (
    <View style={[styles.shell, active && styles.active]}>
      <TextInput
        placeholderTextColor={placeholderTextColor}
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: '100%',
    borderRadius: theme.radius.input,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceLow,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  active: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceHigh,
  },
  input: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: theme.fontWeights.semibold,
    padding: 0,
  },
});
