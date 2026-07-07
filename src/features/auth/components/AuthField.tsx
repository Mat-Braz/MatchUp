import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { theme } from '@/constants/theme';

type AuthFieldProps = TextInputProps & {
  label: string;
  rightLabel?: string;
};

export function AuthField({ label, rightLabel, placeholderTextColor = theme.colors.textDim, style, ...props }: AuthFieldProps) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputShell}>
        <TextInput placeholderTextColor={placeholderTextColor} style={[styles.input, style]} {...props} />
        {rightLabel ? <Text style={styles.rightLabel}>{rightLabel}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    fontWeight: theme.fontWeights.semibold,
    letterSpacing: 0.8,
  },
  inputShell: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: theme.radius.input,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surfaceLow,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.body,
    paddingVertical: 0,
  },
  rightLabel: {
    color: theme.colors.textDim,
    fontSize: 12,
    fontWeight: theme.fontWeights.bold,
    marginLeft: theme.spacing.sm,
  },
});
