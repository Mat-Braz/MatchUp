import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import type {
  ChampionshipDetails,
  ChampionshipType,
} from '@/features/championships';

export type ChampionshipDraft = {
  name: string;
  description: string;
  city: string;
  uf: string;
  isPublic: boolean;
  championshipType: ChampionshipType | null;
  maxParticipants: number;
  hasTrophy: boolean;
  hasMedal: boolean;
  hasCashPrize: boolean;
  prizeFirst: string;
  prizeSecond: string;
  prizeThird: string;
  rulesEnabled: boolean;
  yellowCardLimit: string;
  redCardLimit: string;
  substitutions: string;
};

type ChampionshipWizardContextValue = {
  draft: ChampionshipDraft;
  updateDraft: (patch: Partial<ChampionshipDraft>) => void;
  resetDraft: () => void;
  loadFromChampionship: (championship: ChampionshipDetails) => void;
  editingChampionshipId: number | null;
  setEditingChampionshipId: (id: number | null) => void;
  lastPurchase: { credited: number; balance: number } | null;
  setLastPurchase: (value: { credited: number; balance: number } | null) => void;
  createdChampionshipId: number | null;
  setCreatedChampionshipId: (id: number | null) => void;
};

const emptyDraft: ChampionshipDraft = {
  name: '',
  description: '',
  city: '',
  uf: '',
  isPublic: true,
  championshipType: null,
  maxParticipants: 16,
  hasTrophy: true,
  hasMedal: false,
  hasCashPrize: false,
  prizeFirst: '',
  prizeSecond: '',
  prizeThird: '',
  rulesEnabled: true,
  yellowCardLimit: '2',
  redCardLimit: '1',
  substitutions: '5',
};

function moneyToDraft(value: number | null): string {
  if (value == null) {
    return '';
  }
  return String(value).replace('.', ',');
}

const ChampionshipWizardContext =
  createContext<ChampionshipWizardContextValue | null>(null);

export function ChampionshipWizardProvider({ children }: PropsWithChildren) {
  const [draft, setDraft] = useState<ChampionshipDraft>(emptyDraft);
  const [editingChampionshipId, setEditingChampionshipId] = useState<number | null>(
    null,
  );
  const [lastPurchase, setLastPurchase] = useState<{
    credited: number;
    balance: number;
  } | null>(null);
  const [createdChampionshipId, setCreatedChampionshipId] = useState<number | null>(
    null,
  );

  const updateDraft = useCallback((patch: Partial<ChampionshipDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  }, []);

  const resetDraft = useCallback(() => {
    setDraft(emptyDraft);
    setCreatedChampionshipId(null);
    setEditingChampionshipId(null);
  }, []);

  const loadFromChampionship = useCallback((championship: ChampionshipDetails) => {
    setEditingChampionshipId(championship.id);
    setDraft({
      name: championship.name,
      description: championship.description ?? '',
      city: championship.city ?? '',
      uf: championship.uf ?? '',
      isPublic: championship.isPublic,
      championshipType: championship.championshipType as ChampionshipType,
      maxParticipants: championship.maxParticipants ?? 16,
      hasTrophy: championship.hasTrophy,
      hasMedal: championship.hasMedal,
      hasCashPrize: championship.hasCashPrize,
      prizeFirst: moneyToDraft(championship.prizeFirst),
      prizeSecond: moneyToDraft(championship.prizeSecond),
      prizeThird: moneyToDraft(championship.prizeThird),
      rulesEnabled: championship.rulesEnabled,
      yellowCardLimit: String(championship.yellowCardLimit ?? 2),
      redCardLimit: String(championship.redCardLimit ?? 1),
      substitutions: String(championship.substitutions ?? 5),
    });
  }, []);

  const value = useMemo(
    () => ({
      draft,
      updateDraft,
      resetDraft,
      loadFromChampionship,
      editingChampionshipId,
      setEditingChampionshipId,
      lastPurchase,
      setLastPurchase,
      createdChampionshipId,
      setCreatedChampionshipId,
    }),
    [
      draft,
      updateDraft,
      resetDraft,
      loadFromChampionship,
      editingChampionshipId,
      lastPurchase,
      createdChampionshipId,
    ],
  );

  return (
    <ChampionshipWizardContext.Provider value={value}>
      {children}
    </ChampionshipWizardContext.Provider>
  );
}

export function useChampionshipWizard() {
  const context = useContext(ChampionshipWizardContext);
  if (!context) {
    throw new Error(
      'useChampionshipWizard must be used within ChampionshipWizardProvider',
    );
  }
  return context;
}
