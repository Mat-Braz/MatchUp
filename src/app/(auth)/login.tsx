import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { authRoutes } from '@/constants/authRoutes';
import { theme } from '@/constants/theme';
import { HomeIndicator, PencilButton, PencilField, PencilFullLogo, PencilScreen } from '@/features/auth/components';

export default function LoginScreen() {
  const router = useRouter();

  return (
    <PencilScreen scroll>
      <View style={styles.logoWrap}>
        <PencilFullLogo />
      </View>
      <Text style={styles.title}>Entrar</Text>
      <Text style={styles.subtitle}>Acesse seus campeonatos e partidas</Text>
      <PencilField active label="E-MAIL" placeholder="seu@email.com" top={379} />
      <PencilField active icon="⌾" label="SENHA" placeholder="Digite sua senha" secure top={449} />
      <Text style={styles.forgot} onPress={() => router.push(authRoutes.forgotPassword)}>Esqueceu a senha?</Text>
      <PencilButton height={52} label="Entrar" top={527} onPress={() => router.replace('/(protected)')} />
      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Não tem conta?</Text>
        <Text style={styles.footerTextStrong} onPress={() => router.push(authRoutes.createAccount)}>Criar conta</Text>
      </View>
      <HomeIndicator />
    </PencilScreen>
  );
}

const styles = StyleSheet.create({
  logoWrap: {
    position: 'absolute',
    left: 24,
    top: 78,
    width: 270,
    height: 76,
  },
  title: {
    position: 'absolute',
    left: 24,
    top: 224,
    width: 342,
    color: theme.colors.text,
    fontSize: 40,
    fontWeight: theme.fontWeights.extraBold,
    lineHeight: 43,
  },
  subtitle: {
    position: 'absolute',
    left: 24,
    top: 280,
    width: 342,
    color: '#A6A5B0',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  forgot: {
    position: 'absolute',
    left: 238,
    top: 505,
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: theme.fontWeights.extraBold,
  },
  footerRow: {
    position: 'absolute',
    left: 24,
    top: 689,
    width: 342,
    height: 58,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: theme.fontWeights.bold,
  },
  footerTextStrong: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: theme.fontWeights.extraBold,
  },
});
