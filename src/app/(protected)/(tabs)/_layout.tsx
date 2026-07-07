import { Tabs } from 'expo-router';

import { theme } from '@/constants/theme';

export default function MainTabsLayout() {
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.colors.background },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textDim,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: theme.fontWeights.extraBold,
        },
        tabBarStyle: {
          height: 74,
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.surfaceLow,
          paddingBottom: 10,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="explore" options={{ title: 'Explorar' }} />
      <Tabs.Screen name="contacts" options={{ title: 'Contatos' }} />
      <Tabs.Screen name="notifications" options={{ title: 'Avisos' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
