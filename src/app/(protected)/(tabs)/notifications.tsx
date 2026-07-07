import { EmptyState, ProtectedCanvas, ScreenTitle } from '@/components/layout/PencilProtected';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';

export default function NotificationsScreen() {
  return (
    <ProtectedCanvas active="Notificações">
      <ScreenTitle>Notificações</ScreenTitle>
      <View style={styles.tabs}>
        <Text style={styles.tabActive}>Notificações</Text>
        <Text style={styles.tab}>Convites</Text>
        <Text style={styles.markAll}>Marcar todas</Text>
      </View>
      <EmptyState top={180} title="Sem notificações" message="Quando houver convites, avisos ou atualizações, eles aparecerão aqui." />
    </ProtectedCanvas>
  );
}

const styles = StyleSheet.create({
  tabs: {
    position: 'absolute',
    left: 24,
    top: 117,
    width: 342,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 26,
  },
  tabActive: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: theme.fontWeights.extraBold,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary,
    paddingBottom: 9,
  },
  tab: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: theme.fontWeights.extraBold,
  },
  markAll: {
    marginLeft: 'auto',
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: theme.fontWeights.extraBold,
  },
});
