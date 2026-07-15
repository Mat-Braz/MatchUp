import { StyleSheet, View } from 'react-native';

import { theme } from '@/constants/theme';

export function HomeIndicator({ top = 822 }: { top?: number }) {
  return <View style={[styles.homeIndicator, { top }]} />;
}

const styles = StyleSheet.create({
  homeIndicator: {
    position: 'absolute',
    left: 130,
    width: 130,
    height: 5,
    borderRadius: theme.radius.pill,
    backgroundColor: '#2A2A2A',
  },
});
