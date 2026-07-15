import type { Href } from 'expo-router';

export const authRoutes = {
  splash: '/(auth)/splash' as Href,
  login: '/(auth)/login' as Href,
  createAccount: '/(auth)/(register)/create-account' as Href,
  accessData: '/(auth)/(register)/access-data' as Href,
  personalData: '/(auth)/(register)/personal-data' as Href,
  verifyCode: '/(auth)/(register)/verify-code' as Href,
  forgotPassword: '/(auth)/(recovery)/forgot-password' as Href,
  verifyRecoveryCode: '/(auth)/(recovery)/verify-recovery-code' as Href,
  resetPassword: '/(auth)/(recovery)/reset-password' as Href,
} as const;
