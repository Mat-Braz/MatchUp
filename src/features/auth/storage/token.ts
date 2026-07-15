import { requireOptionalNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'matchup.accessToken';

/** Fallback when SecureStore native module is missing (old dev build / web). */
let memoryToken: string | null = null;

function isSecureStoreAvailable(): boolean {
  return requireOptionalNativeModule('ExpoSecureStore') != null;
}

async function readSecureStore(key: string): Promise<string | null | undefined> {
  if (!isSecureStoreAvailable()) {
    return undefined;
  }

  const SecureStore = await import('expo-secure-store');
  return await SecureStore.getItemAsync(key);
}

async function writeSecureStore(key: string, value: string): Promise<boolean> {
  if (!isSecureStoreAvailable()) {
    return false;
  }

  const SecureStore = await import('expo-secure-store');
  await SecureStore.setItemAsync(key, value);
  return true;
}

async function deleteSecureStore(key: string): Promise<boolean> {
  if (!isSecureStoreAvailable()) {
    return false;
  }

  const SecureStore = await import('expo-secure-store');
  await SecureStore.deleteItemAsync(key);
  return true;
}

export async function getAccessToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(ACCESS_TOKEN_KEY) ?? memoryToken;
  }

  const stored = await readSecureStore(ACCESS_TOKEN_KEY);
  if (stored !== undefined) {
    return stored;
  }

  return memoryToken;
}

export async function setAccessToken(token: string): Promise<void> {
  memoryToken = token;

  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(ACCESS_TOKEN_KEY, token);
    return;
  }

  await writeSecureStore(ACCESS_TOKEN_KEY, token);
}

export async function clearAccessToken(): Promise<void> {
  memoryToken = null;

  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(ACCESS_TOKEN_KEY);
    return;
  }

  await deleteSecureStore(ACCESS_TOKEN_KEY);
}
