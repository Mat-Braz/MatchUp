import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type Requirement = {
  label: string;
  met: boolean;
};

function getRequirements(password: string, compact: boolean): Requirement[] {
  const hasMinLength = password.length >= 8;
  const hasTwoNumbers = (password.match(/\d/g) ?? []).length >= 2;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (compact) {
    return [
      { label: 'Mínimo de 8 caracteres', met: hasMinLength },
      { label: 'Dois ou mais números', met: hasTwoNumbers },
      {
        label: 'Letra maiúscula, minúscula e caractere especial',
        met: hasLowercase && hasUppercase && hasSpecial,
      },
    ];
  }

  return [
    { label: 'Mínimo de 8 caracteres', met: hasMinLength },
    { label: 'Dois ou mais números', met: hasTwoNumbers },
    { label: 'Caractere especial (como @, #, $, %, ©)', met: hasSpecial },
    { label: 'Uma ou mais letras minúsculas', met: hasLowercase },
    { label: 'Uma ou mais letra maiúsculas', met: hasUppercase },
  ];
}

export function meetsPasswordRequirements(password: string, compact = false): boolean {
  return getRequirements(password, compact).every((item) => item.met);
}

export function SecurityCard({
  compact = false,
  top,
  password = '',
}: {
  compact?: boolean;
  top?: number;
  password?: string;
}) {
  const requirements = getRequirements(password, compact);
  const allMet = requirements.every((item) => item.met);

  return (
    <View
      style={[
        styles.securityCard,
        compact && styles.securityCardCompact,
        top !== undefined && { top },
      ]}
    >
      <View style={styles.securityHeader}>
        {!compact ? (
          <Text style={[styles.securityShield, allMet && styles.requirementDone]}>✓</Text>
        ) : null}
        <Text style={[styles.securityTitle, compact && styles.securityTitleCompact]}>
          Requisitos de segurança
        </Text>
      </View>
      {requirements.map((item) => (
        <View key={item.label} style={styles.requirementRow}>
          <Text
            style={[
              styles.requirementDot,
              compact && styles.requirementDotCompact,
              item.met && styles.requirementDone,
            ]}
          >
            {compact ? '●' : item.met ? '✓' : '○'}
          </Text>
          <Text
            adjustsFontSizeToFit={compact}
            minimumFontScale={0.9}
            numberOfLines={compact ? 1 : undefined}
            style={[
              styles.requirementText,
              compact && styles.requirementTextCompact,
              item.met && (compact ? styles.requirementTextCompactDone : styles.requirementTextDone),
            ]}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  securityCard: {
    position: 'absolute',
    left: 20,
    top: 452,
    width: 350,
    height: 181,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceCard,
    padding: 18,
    gap: 10,
  },
  securityCardCompact: {
    left: 24,
    top: 562,
    width: 342,
    height: 142,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  securityShield: {
    color: '#6E6D78',
    fontSize: 16,
    fontWeight: theme.fontWeights.extraBold,
  },
  securityTitle: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: theme.fontWeights.extraBold,
  },
  securityTitleCompact: {
    fontSize: 13,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
  },
  requirementDot: {
    color: '#6E6D78',
    fontSize: 11,
  },
  requirementDone: {
    color: theme.colors.primary,
  },
  requirementText: {
    flex: 1,
    color: '#73727D',
    fontSize: 12,
    fontWeight: theme.fontWeights.bold,
  },
  requirementTextCompact: {
    color: '#73727D',
    fontSize: 12,
    lineHeight: 16,
  },
  requirementDotCompact: {
    color: '#6E6D78',
    fontSize: 11,
    lineHeight: 16,
  },
  requirementTextCompactDone: {
    color: theme.colors.primary,
  },
  requirementTextDone: {
    color: theme.colors.textMuted,
  },
});
