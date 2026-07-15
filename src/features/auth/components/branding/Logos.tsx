import { Image, ImageSourcePropType, ImageStyle, StyleProp, StyleSheet } from 'react-native';

const splashLogo = require('../../../../../assets/images/bOQhA.png') as ImageSourcePropType;
const fullLogo = require('../../../../../assets/images/RgTnC.png') as ImageSourcePropType;

export function PencilSplashLogo() {
  return <Image source={splashLogo} style={styles.splashLogo} resizeMode="contain" />;
}

export function PencilFullLogo({ style }: { style?: StyleProp<ImageStyle> }) {
  return <Image source={fullLogo} style={[styles.fullLogo, style]} resizeMode="contain" />;
}

const styles = StyleSheet.create({
  splashLogo: {
    position: 'absolute',
    left: 80,
    top: 265,
    width: 230,
    height: 210,
  },
  fullLogo: {
    width: 216,
    height: 60,
  },
});
