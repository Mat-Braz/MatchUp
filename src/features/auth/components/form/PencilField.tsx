import { cloneElement, isValidElement, useState, type ReactElement, type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { theme } from '@/constants/theme';

function FieldIcon({
  icon,
  color,
  onPress,
}: {
  icon: ReactNode;
  color: string;
  onPress?: () => void;
}) {
  const content =
    typeof icon === 'string' ? (
      <Text style={[styles.fieldIconGlyph, { color }]}>{icon}</Text>
    ) : isValidElement(icon) ? (
      cloneElement(icon as ReactElement<{ color?: string; size?: number }>, {
        color,
        size: (icon.props as { size?: number }).size ?? 20,
      })
    ) : (
      icon
    );

  if (!onPress) {
    return <View style={styles.fieldIconSlot}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={10}
      onPress={onPress}
      style={({ pressed }) => [styles.fieldIconSlot, pressed && styles.fieldIconPressed]}
    >
      {content}
    </Pressable>
  );
}

export function PencilField({
  label,
  placeholder,
  top,
  left = 24,
  width = 342,
  active = false,
  secure = false,
  icon,
  onIconPress,
  onBlur,
  onFocus,
  keyboardType,
  autoCapitalize,
  value,
  onChangeText,
  editable = true,
  autoCorrect,
  textContentType,
}: {
  label: string;
  placeholder: string;
  top?: number;
  left?: number;
  width?: number;
  active?: boolean;
  secure?: boolean;
  icon?: ReactNode;
  onIconPress?: () => void;
  onBlur?: () => void;
  onFocus?: () => void;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  value?: string;
  onChangeText?: (text: string) => void;
  editable?: boolean;
  autoCorrect?: boolean;
  textContentType?: TextInputProps['textContentType'];
}) {
  const [focused, setFocused] = useState(false);
  const emphasize = focused || active;
  const iconColor = focused ? theme.colors.primary : '#A6A5B0';
  const positioned = top !== undefined;

  return (
    <View style={[styles.fieldGroup, positioned ? { left, top, width } : styles.fieldGroupFlow]}>
      <Text style={[styles.fieldLabel, emphasize && styles.fieldLabelFocused]}>{label}</Text>
      <View style={[styles.fieldInput, focused && styles.fieldInputFocused]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          placeholder={placeholder}
          placeholderTextColor={focused ? theme.colors.textDim : '#80808A'}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          onFocus={() => {
            setFocused(true);
            onFocus?.();
          }}
          secureTextEntry={secure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          textContentType={textContentType}
          style={styles.fieldText}
          selectionColor={theme.colors.primary}
        />
        {icon ? <FieldIcon icon={icon} color={iconColor} onPress={onIconPress} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    position: 'absolute',
    gap: 7,
  },
  fieldGroupFlow: {
    position: 'relative',
    width: '100%',
  },
  fieldLabel: {
    color: '#A6A5B0',
    fontSize: 12,
    fontWeight: theme.fontWeights.extraBold,
    letterSpacing: 0.7,
  },
  fieldLabelFocused: {
    color: theme.colors.textMuted,
  },
  fieldInput: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: theme.radius.input,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceCard,
    paddingHorizontal: 16,
  },
  fieldInputFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceLow,
  },
  fieldText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '500',
    padding: 0,
    margin: 0,
  },
  fieldIconSlot: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldIconPressed: {
    opacity: 0.7,
  },
  fieldIconGlyph: {
    fontSize: 18,
    fontWeight: theme.fontWeights.semibold,
  },
});
