import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

export function AccountTypeCard({
  selected,
  title,
  description,
  icon,
  top,
  onPress,
}: {
  selected?: boolean;
  title: string;
  description: string;
  icon: string;
  top: number;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.accountCard, selected && styles.accountCardSelected, { top }]}
    >
      <View style={[styles.accountIconBadge, selected && styles.accountIconBadgeSelected]}>
        <Text style={[styles.accountIcon, selected && styles.accountIconSelected]}>{icon}</Text>
      </View>
      <View style={styles.accountCopy}>
        <Text style={styles.accountTitle}>{title}</Text>
        <Text style={styles.accountDescription}>{description}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  accountCard: {
    position: 'absolute',
    left: 24,
    width: 342,
    height: 142,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceCard,
    padding: 18,
  },
  accountCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#1D2418',
  },
  accountIconBadge: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: theme.colors.border,
  },
  accountIconBadgeSelected: {
    backgroundColor: theme.colors.primary,
  },
  accountIcon: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: theme.fontWeights.extraBold,
  },
  accountIconSelected: {
    color: theme.colors.black,
  },
  accountCopy: {
    flex: 1,
    gap: 7,
  },
  accountTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: theme.fontWeights.extraBold,
  },
  accountDescription: {
    color: '#A6A5B0',
    fontSize: 12.5,
    fontWeight: theme.fontWeights.semibold,
    lineHeight: 17,
  },
});
