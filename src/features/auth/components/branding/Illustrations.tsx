import { Image, ImageSourcePropType, StyleSheet } from 'react-native';

const forgotIllustration = require('../../../../../assets/images/W9iLT.png') as ImageSourcePropType;
const otpIllustration = require('../../../../../assets/images/tVGiO.png') as ImageSourcePropType;

export function ForgotIllustration() {
  return <Image source={forgotIllustration} style={styles.forgotIllustration} resizeMode="contain" />;
}

export function OtpIllustration() {
  return <Image source={otpIllustration} style={styles.otpIllustration} resizeMode="contain" />;
}

const styles = StyleSheet.create({
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
