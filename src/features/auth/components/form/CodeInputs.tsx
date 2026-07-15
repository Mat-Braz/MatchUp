import { useRef } from 'react';
import {
  NativeSyntheticEvent,
  StyleSheet,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from 'react-native';

import { theme } from '@/constants/theme';
import { onlyDigits } from '@/lib/masks';

const CODE_LENGTH = 5;

export function CodeInputs({
  value,
  onChange,
  editable = true,
}: {
  value: string;
  onChange: (code: string) => void;
  editable?: boolean;
}) {
  const inputsRef = useRef<Array<TextInput | null>>([]);
  const digits = onlyDigits(value).padEnd(CODE_LENGTH, ' ').slice(0, CODE_LENGTH).split('');

  function updateAt(index: number, nextDigit: string) {
    const current = onlyDigits(value).padEnd(CODE_LENGTH, ' ').split('');
    current[index] = nextDigit;
    const next = current.join('').replace(/ /g, '').slice(0, CODE_LENGTH);
    onChange(next);

    if (nextDigit && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleChange(index: number, text: string) {
    const cleaned = onlyDigits(text);
    if (!cleaned) {
      updateAt(index, '');
      return;
    }

    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, CODE_LENGTH - index).split('');
      const current = onlyDigits(value).padEnd(CODE_LENGTH, ' ').split('');
      chars.forEach((char, offset) => {
        current[index + offset] = char;
      });
      const next = current.join('').replace(/ /g, '').slice(0, CODE_LENGTH);
      onChange(next);
      const focusIndex = Math.min(index + chars.length, CODE_LENGTH - 1);
      inputsRef.current[focusIndex]?.focus();
      return;
    }

    updateAt(index, cleaned);
  }

  function handleKeyPress(
    index: number,
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
  ) {
    if (event.nativeEvent.key !== 'Backspace') {
      return;
    }

    const currentDigit = onlyDigits(value)[index];
    if (!currentDigit && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  return (
    <View style={styles.codeRow}>
      {Array.from({ length: CODE_LENGTH }).map((_, index) => {
        const digit = digits[index]?.trim() ?? '';
        return (
          <TextInput
            key={index}
            ref={(ref) => {
              inputsRef.current[index] = ref;
            }}
            value={digit}
            onChangeText={(text) => handleChange(index, text)}
            onKeyPress={(event) => handleKeyPress(index, event)}
            editable={editable}
            keyboardType="number-pad"
            maxLength={CODE_LENGTH}
            textAlign="center"
            selectionColor={theme.colors.primary}
            style={[styles.codeBox, digit ? styles.codeBoxFilled : null]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  codeRow: {
    position: 'absolute',
    left: 20,
    top: 214,
    width: 350,
    height: 62,
    flexDirection: 'row',
    gap: 16,
  },
  codeBox: {
    flex: 1,
    height: 62,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceCard,
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: theme.fontWeights.extraBold,
    padding: 0,
  },
  codeBoxFilled: {
    borderColor: theme.colors.borderStrong,
  },
});
