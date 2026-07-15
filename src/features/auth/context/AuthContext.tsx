import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import {
  loginRequest,
  verifyCodeAndRegisterRequest,
  type LoginInput,
  type VerifyCodeAndRegisterInput,
} from '@/features/auth/api/auth';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/features/auth/storage/token';

type AuthContextValue = {
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (input: LoginInput) => Promise<void>;
  completeRegistration: (input: VerifyCodeAndRegisterInput) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const stored = await getAccessToken();
        if (mounted) {
          setToken(stored);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = useCallback(async (input: LoginInput) => {
    const accessToken = await loginRequest(input);
    await setAccessToken(accessToken);
    setToken(accessToken);
  }, []);

  const completeRegistration = useCallback(async (input: VerifyCodeAndRegisterInput) => {
    const accessToken = await verifyCodeAndRegisterRequest(input);
    await setAccessToken(accessToken);
    setToken(accessToken);
  }, []);

  const signOut = useCallback(async () => {
    await clearAccessToken();
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      isLoading,
      isAuthenticated: Boolean(token),
      signIn,
      completeRegistration,
      signOut,
    }),
    [token, isLoading, signIn, completeRegistration, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
