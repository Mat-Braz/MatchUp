import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/constants/theme';

type PencilScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  keyboardScroll?: boolean;
  style?: StyleProp<ViewStyle>;
  canvasHeight?: number;
};

export function PencilScreen({
  children,
  scroll = false,
  keyboardScroll = false,
  style,
  canvasHeight = 844,
}: PencilScreenProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const usesScrollView = scroll || keyboardScroll;
  const scale = usesScrollView ? width / 390 : Math.min(width / 390, height / 844);

  useEffect(() => {
    if (!keyboardScroll) {
      return;
    }

    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [keyboardScroll]);
  const canvas = (
    <View style={[styles.canvas, { height: canvasHeight, transform: [{ scale }] }, style]}>
      {children}
    </View>
  );

  if (usesScrollView) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scroll}
          scrollEnabled={scroll && !keyboardScroll ? true : keyboardVisible}
          bounces={scroll && !keyboardScroll ? true : keyboardVisible}
          contentContainerStyle={[
            styles.scrollContent,
            { minHeight: height, paddingBottom: Math.max(insets.bottom, 16) },
          ]}
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
