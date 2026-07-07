import {
  Image,
  ImageSourcePropType,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';

import { theme } from '@/constants/theme';

const splashLogo = require('../../../../assets/images/bOQhA.png') as ImageSourcePropType;
const fullLogo = require('../../../../assets/images/RgTnC.png') as ImageSourcePropType;
const forgotIllustration = require('../../../../assets/images/W9iLT.png') as ImageSourcePropType;
const otpIllustration = require('../../../../assets/images/tVGiO.png') as ImageSourcePropType;

type PencilScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PencilScreen({ children, scroll = false, style }: PencilScreenProps) {
  const { width, height } = useWindowDimensions();
  const scale = scroll ? width / 390 : Math.min(width / 390, height / 844);
  const canvas = <View style={[styles.canvas, { transform: [{ scale }] }, style]}>{children}</View>;

  if (scroll) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { minHeight: height }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ width: 390 * scale, height: 844 * scale, alignItems: 'center', justifyContent: 'center' }}>{canvas}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.root}>
      {canvas}
    </View>
  );
}

export function PencilSplashLogo() {
  return <Image source={splashLogo} style={styles.splashLogo} resizeMode="contain" />;
}

export function PencilFullLogo() {
  return <Image source={fullLogo} style={styles.fullLogo} resizeMode="contain" />;
}

export function HomeIndicator({ top = 822 }: { top?: number }) {
  return <View style={[styles.homeIndicator, { top }]} />;
}

export function AuthTitle({ title, subtitle, top = 65 }: { title: string; subtitle: string; top?: number }) {
  return (
    <>
      <Text style={[styles.title, { top }]}>{title}</Text>
      <Text style={[styles.subtitle, { top: top + 52 }]}>{subtitle}</Text>
    </>
  );
}

export function AuthHeader({ title }: { title: string }) {
  return (
    <View style={styles.headerRow}>
      <Text style={styles.backIcon}>‹</Text>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
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
  onBlur,
  onFocus,
}: {
  label: string;
  placeholder: string;
  top: number;
  left?: number;
  width?: number;
  active?: boolean;
  secure?: boolean;
  icon?: string;
  onBlur?: () => void;
  onFocus?: () => void;
}) {
  return (
    <View style={[styles.fieldGroup, { left, top, width }]}>
      <Text style={[styles.fieldLabel, active && styles.loginFieldLabel]}>{label}</Text>
      <View style={[styles.fieldInput, active && styles.loginFieldInput]}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={active ? '#84967C' : '#80808A'}
          onBlur={onBlur}
          onFocus={onFocus}
          secureTextEntry={secure}
          style={styles.fieldText}
        />
        {icon ? <Text style={styles.fieldIcon}>{icon}</Text> : null}
      </View>
    </View>
  );
}

export function PencilButton({ label, top, onPress, left = 24, width = 342, height = 56 }: { label: string; top: number; onPress?: () => void; left?: number; width?: number; height?: number }) {
  return (
    <Pressable style={[styles.button, { left, top, width, height }]} onPress={onPress}>
      <Text style={styles.buttonLabel}>{label}</Text>
    </Pressable>
  );
}

export function Progress({ current }: { current: 1 | 2 | 3 }) {
  return (
    <View style={styles.progress}>
      {[1, 2, 3].map((step) => (
        <View key={step} style={[styles.progressPill, step <= current && styles.progressPillActive]} />
      ))}
      <Text style={styles.progressLabel}>{current}/3</Text>
    </View>
  );
}

export function AccountTypeCard({ selected, title, description, icon, top }: { selected?: boolean; title: string; description: string; icon: string; top: number }) {
  return (
    <View style={[styles.accountCard, selected && styles.accountCardSelected, { top }]}>
      <View style={[styles.accountIconBadge, selected && styles.accountIconBadgeSelected]}>
        <Text style={[styles.accountIcon, selected && styles.accountIconSelected]}>{icon}</Text>
      </View>
      <View style={styles.accountCopy}>
        <Text style={styles.accountTitle}>{title}</Text>
        <Text style={styles.accountDescription}>{description}</Text>
      </View>
    </View>
  );
}

export function SecurityCard({ compact = false, top }: { compact?: boolean; top?: number }) {
  const requirements = compact
    ? ['Mínimo de 8 caracteres', 'Dois ou mais números', 'Letra maiúscula, minúscula e caractere especial']
    : ['Mínimo de 8 caracteres', 'Dois ou mais números', 'Caractere especial (como @, #, $, %, ©)', 'Uma ou mais letras minúsculas', 'Uma ou mais letra maiúsculas'];

  return (
    <View style={[styles.securityCard, compact && styles.securityCardCompact, top !== undefined && { top }]}>
      <View style={styles.securityHeader}>
        <Text style={styles.securityShield}>✓</Text>
        <Text style={styles.securityTitle}>Requisitos de segurança</Text>
      </View>
      {requirements.map((item, index) => (
        <View key={item} style={styles.requirementRow}>
          <Text style={[styles.requirementDot, index === 0 && !compact && styles.requirementDone]}>{index === 0 && !compact ? '✓' : '○'}</Text>
          <Text style={[styles.requirementText, compact && styles.requirementTextCompact]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function CodeInputs() {
  return (
    <View style={styles.codeRow}>
      {Array.from({ length: 5 }).map((_, index) => (
        <View key={index} style={styles.codeBox} />
      ))}
    </View>
  );
}

export function ConfirmationOverlay({ title, message, buttonLabel }: { title: string; message: string; buttonLabel: string }) {
  return (
    <>
      <View style={styles.modalDim} />
      <View style={styles.confirmationCard}>
        <View style={styles.confirmationIconBall}>
          <Text style={styles.confirmationIcon}>✓</Text>
        </View>
        <Text style={styles.confirmationTitle}>{title}</Text>
        <Text style={styles.confirmationMessage}>{message}</Text>
        <PencilButton label={buttonLabel} top={262} left={24} width={294} height={58} />
      </View>
    </>
  );
}

export function ForgotIllustration() {
  return <Image source={forgotIllustration} style={styles.forgotIllustration} resizeMode="contain" />;
}

export function OtpIllustration() {
  return <Image source={otpIllustration} style={styles.otpIllustration} resizeMode="contain" />;
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
  splashLogo: {
    position: 'absolute',
    left: 80,
    top: 265,
    width: 230,
    height: 210,
  },
  fullLogo: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 270,
    height: 76,
  },
  homeIndicator: {
    position: 'absolute',
    left: 130,
    width: 130,
    height: 5,
    borderRadius: theme.radius.pill,
    backgroundColor: '#2A2A2A',
  },
  title: {
    position: 'absolute',
    left: 24,
    width: 342,
    color: theme.colors.text,
    fontSize: 38,
    fontWeight: theme.fontWeights.extraBold,
    lineHeight: 42,
  },
  subtitle: {
    position: 'absolute',
    left: 24,
    width: 342,
    color: '#A6A5B0',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  headerRow: {
    position: 'absolute',
    left: 16,
    top: 28,
    width: 358,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backIcon: {
    color: theme.colors.textMuted,
    fontSize: 35,
    lineHeight: 36,
    fontWeight: theme.fontWeights.regular,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: theme.fontWeights.extraBold,
    lineHeight: 24,
  },
  fieldGroup: {
    position: 'absolute',
    gap: 7,
  },
  fieldLabel: {
    color: '#A6A5B0',
    fontSize: 12,
    fontWeight: theme.fontWeights.extraBold,
    letterSpacing: 0.7,
  },
  loginFieldLabel: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: theme.fontWeights.semibold,
  },
  fieldInput: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceCard,
    paddingHorizontal: 16,
  },
  loginFieldInput: {
    height: 48,
    borderRadius: 12,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surfaceLow,
    paddingHorizontal: 14,
  },
  fieldText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '500',
    padding: 0,
  },
  fieldIcon: {
    color: '#A6A5B0',
    fontSize: 18,
    marginLeft: 8,
  },
  button: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
  },
  buttonLabel: {
    color: theme.colors.black,
    fontSize: 16,
    fontWeight: theme.fontWeights.extraBold,
  },
  progress: {
    position: 'absolute',
    left: 24,
    top: 162,
    width: 342,
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressPill: {
    flex: 1,
    height: 5,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.border,
  },
  progressPillActive: {
    backgroundColor: theme.colors.primary,
  },
  progressLabel: {
    color: '#A6A5B0',
    fontSize: 12,
    fontWeight: theme.fontWeights.extraBold,
  },
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
  securityCard: {
    position: 'absolute',
    left: 20,
    top: 452,
    width: 350,
    height: 181,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceCard,
    padding: 18,
    gap: 10,
  },
  securityCardCompact: {
    left: 24,
    top: 562,
    width: 342,
    height: 96,
    padding: 12,
    gap: 6,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  securityShield: {
    color: theme.colors.primaryPale,
    fontSize: 16,
    fontWeight: theme.fontWeights.extraBold,
  },
  securityTitle: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: theme.fontWeights.extraBold,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  requirementDot: {
    color: '#6E6D78',
    fontSize: 11,
  },
  requirementDone: {
    color: theme.colors.primaryPale,
  },
  requirementText: {
    flex: 1,
    color: '#73727D',
    fontSize: 12,
    fontWeight: theme.fontWeights.bold,
  },
  requirementTextCompact: {
    color: '#A6A5B0',
    fontSize: 9.5,
  },
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
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceCard,
  },
  modalDim: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 390,
    height: 844,
    backgroundColor: '#00000099',
  },
  confirmationCard: {
    position: 'absolute',
    left: 24,
    top: 250,
    width: 342,
    height: 344,
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surfaceCard,
    padding: 24,
    gap: 20,
  },
  confirmationIconBall: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 29,
    backgroundColor: theme.colors.primary,
  },
  confirmationIcon: {
    color: theme.colors.black,
    fontSize: 34,
    fontWeight: theme.fontWeights.extraBold,
  },
  confirmationTitle: {
    width: 294,
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: theme.fontWeights.extraBold,
    lineHeight: 33,
    textAlign: 'center',
  },
  confirmationMessage: {
    width: 311,
    color: '#C5C4CC',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
    textAlign: 'center',
  },
  forgotIllustration: {
    position: 'absolute',
    left: 24,
    top: 392,
    width: 342,
    height: 342,
  },
  otpIllustration: {
    position: 'absolute',
    left: 35,
    top: 403,
    width: 320,
    height: 276,
  },
});
