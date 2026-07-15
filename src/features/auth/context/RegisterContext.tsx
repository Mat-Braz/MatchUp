import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

export type AccountType = 'athlete';

export type RegisterDraft = {
  accountType: AccountType | null;
  name: string;
  email: string;
  password: string;
  birthDate: string;
  phone: string;
  cep: string;
  city: string;
  uf: string;
};

type AccessDataInput = {
  name: string;
  email: string;
  password: string;
};

type PersonalDataInput = {
  birthDate: string;
  phone: string;
  cep: string;
  city: string;
  uf: string;
};

type RegisterContextValue = {
  draft: RegisterDraft;
  setAccountType: (accountType: AccountType) => void;
  setAccessData: (data: AccessDataInput) => void;
  setPersonalData: (data: PersonalDataInput) => void;
  clearDraft: () => void;
  hasCompleteDraft: boolean;
};

const emptyDraft: RegisterDraft = {
  accountType: null,
  name: '',
  email: '',
  password: '',
  birthDate: '',
  phone: '',
  cep: '',
  city: '',
  uf: '',
};

const RegisterContext = createContext<RegisterContextValue | null>(null);

export function RegisterProvider({ children }: PropsWithChildren) {
  const [draft, setDraft] = useState<RegisterDraft>(emptyDraft);

  const setAccountType = useCallback((accountType: AccountType) => {
    setDraft((current) => ({ ...current, accountType }));
  }, []);

  const setAccessData = useCallback((data: AccessDataInput) => {
    setDraft((current) => ({
      ...current,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
    }));
  }, []);

  const setPersonalData = useCallback((data: PersonalDataInput) => {
    setDraft((current) => ({
      ...current,
      birthDate: data.birthDate,
      phone: data.phone,
      cep: data.cep,
      city: data.city.trim(),
      uf: data.uf.trim().toUpperCase(),
    }));
  }, []);

  const clearDraft = useCallback(() => {
    setDraft(emptyDraft);
  }, []);

  const hasCompleteDraft = Boolean(
    draft.accountType &&
      draft.name &&
      draft.email &&
      draft.password &&
      draft.birthDate &&
      draft.phone &&
      draft.cep &&
      draft.city &&
      draft.uf,
  );

  const value = useMemo(
    () => ({
      draft,
      setAccountType,
      setAccessData,
      setPersonalData,
      clearDraft,
      hasCompleteDraft,
    }),
    [draft, setAccountType, setAccessData, setPersonalData, clearDraft, hasCompleteDraft],
  );

  return <RegisterContext.Provider value={value}>{children}</RegisterContext.Provider>;
}

export function useRegister() {
  const context = useContext(RegisterContext);

  if (!context) {
    throw new Error('useRegister must be used within RegisterProvider');
  }

  return context;
}
