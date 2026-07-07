import type { Href } from 'expo-router';

export const authRoutes = {
  splash: '/(auth)/splash' as Href,
  login: '/(auth)/login' as Href,
  createAccount: '/(auth)/create-account' as Href,
  accessData: '/(auth)/access-data' as Href,
  personalData: '/(auth)/personal-data' as Href,
  verifyCode: '/(auth)/verify-code' as Href,
  forgotPassword: '/(auth)/forgot-password' as Href,
  resetPassword: '/(auth)/reset-password' as Href,
} as const;
