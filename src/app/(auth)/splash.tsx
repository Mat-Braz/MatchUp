import { useEffect, useRef } from "react";
import {
  Animated,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";

import { authRoutes } from "@/constants/authRoutes";
import { theme } from "@/constants/theme";
import { PencilScreen, PencilSplashLogo } from "@/features/auth";

const soccerBall =
  require("../../../assets/images/GVsf4.png") as ImageSourcePropType;

export default function SplashScreen() {
  const router = useRouter();
  const rotation = useRef(new Animated.Value(0)).current;
  const hasNavigated = useRef(false);

  function goToLogin() {
    if (hasNavigated.current) {
      return;
    }

    hasNavigated.current = true;
    router.replace(authRoutes.login);
  }

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    );

    animation.start();
    const timer = setTimeout(goToLogin, 3000);

    return () => {
      animation.stop();
      clearTimeout(timer);
    };
  }, [rotation]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Pressable style={styles.pressArea} onPress={goToLogin}>
      <PencilScreen>
        <PencilSplashLogo />
        <Animated.Image
          source={soccerBall}
          style={[styles.ball, { transform: [{ rotate: spin }] }]}
          resizeMode="contain"
        />
      </PencilScreen>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  ball: {
    position: "absolute",
    left: 164,
    top: 567,
    width: 61,
    height: 61,
  },
});
