import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';

import { theme } from '@/constants/theme';

type PencilScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  canvasHeight?: number;
};

export function PencilScreen({
  children,
  scroll = false,
  style,
  canvasHeight = 844,
}: PencilScreenProps) {
  const { width, height } = useWindowDimensions();
  const scale = scroll ? width / 390 : Math.min(width / 390, height / 844);
  const canvas = (
    <View style={[styles.canvas, { height: canvasHeight, transform: [{ scale }] }, style]}>
      {children}
    </View>
  );

  if (scroll) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { minHeight: height }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              width: 390 * scale,
              height: canvasHeight * scale,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {canvas}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return <View style={styles.root}>{canvas}</View>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    overflow: 'hidden',
  },
  scrollContent: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  canvas: {
    width: 390,
    height: 844,
    backgroundColor: theme.colors.background,
  },
});
