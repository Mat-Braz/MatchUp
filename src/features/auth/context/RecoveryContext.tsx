import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

type RecoveryDraft = {
  email: string;
  code: string;
};

type RecoveryContextValue = {
  draft: RecoveryDraft;
  setEmail: (email: string) => void;
  setCode: (code: string) => void;
  clearDraft: () => void;
  hasEmail: boolean;
  hasCode: boolean;
};

const emptyDraft: RecoveryDraft = {
  email: '',
  code: '',
};

const RecoveryContext = createContext<RecoveryContextValue | null>(null);

export function RecoveryProvider({ children }: PropsWithChildren) {
  const [draft, setDraft] = useState<RecoveryDraft>(emptyDraft);

  const setEmail = useCallback((email: string) => {
    setDraft((current) => ({
      ...current,
      email: email.trim().toLowerCase(),
      code: '',
    }));
  }, []);

  const setCode = useCallback((code: string) => {
    setDraft((current) => ({
      ...current,
      code: code.trim(),
    }));
  }, []);

  const clearDraft = useCallback(() => {
    setDraft(emptyDraft);
  }, []);

  const hasEmail = Boolean(draft.email);
  const hasCode = Boolean(draft.email && draft.code.length === 5);

  const value = useMemo(
    () => ({
      draft,
      setEmail,
      setCode,
      clearDraft,
      hasEmail,
      hasCode,
    }),
    [draft, setEmail, setCode, clearDraft, hasEmail, hasCode],
  );

  return <RecoveryContext.Provider value={value}>{children}</RecoveryContext.Provider>;
}

export function useRecovery() {
  const context = useContext(RecoveryContext);

  if (!context) {
    throw new Error('useRecovery must be used within RecoveryProvider');
  }

  return context;
}
