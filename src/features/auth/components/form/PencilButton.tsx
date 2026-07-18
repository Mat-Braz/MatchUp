import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

import { theme } from "@/constants/theme";

export function PencilButton({
  label,
  top,
  onPress,
  left = 24,
  width = 342,
  height = 56,
  disabled = false,
  tone = "primary",
  style,
}: {
  label: string;
  top?: number;
  onPress?: () => void;
  left?: number;
  width?: number | `${number}%`;
  height?: number;
  disabled?: boolean;
  tone?: "primary" | "danger";
  style?: StyleProp<ViewStyle>;
}) {
  const positioned = top !== undefined;

  return (
    <Pressable
      disabled={disabled}
      style={[
        styles.button,
        tone === "danger" ? styles.buttonDanger : null,
        positioned
          ? { left, top, width, height }
          : [styles.buttonFlow, { width: "100%", height }],
        disabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.buttonLabel,
          tone === "danger" && styles.buttonLabelDanger,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
  },
  buttonDanger: {
    backgroundColor: theme.colors.danger,
  },
  buttonFlow: {
    position: "relative",
    alignSelf: "stretch",
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonLabel: {
    color: theme.colors.black,
    fontSize: 16,
    fontWeight: theme.fontWeights.extraBold,
  },
  buttonLabelDanger: {
    color: "#FFFFFF",
  },
});
