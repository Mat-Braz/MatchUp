import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import type { SquadSize } from '../formations';

export type TeamCreateDraft = {
  teamId: number | null;
  name: string;
  sigla: string;
  shieldUrl: string | null;
  invitedPlayerIds: number[];
  squadSize: SquadSize;
  formationId: string;
  /** slotId -> playerId */
  assignments: Record<string, number>;
};

type TeamCreateContextValue = {
  draft: TeamCreateDraft;
  updateDraft: (patch: Partial<TeamCreateDraft>) => void;
  resetDraft: () => void;
  setAssignment: (slotId: string, playerId: number | null) => void;
};

const emptyDraft: TeamCreateDraft = {
  teamId: null,
  name: '',
  sigla: '',
  shieldUrl: null,
  invitedPlayerIds: [],
  squadSize: 5,
  formationId: '1-2-1',
  assignments: {},
};

const TeamCreateContext = createContext<TeamCreateContextValue | null>(null);

export function TeamCreateProvider({ children }: PropsWithChildren) {
  const [draft, setDraft] = useState<TeamCreateDraft>(emptyDraft);

  const updateDraft = useCallback((patch: Partial<TeamCreateDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  }, []);

  const resetDraft = useCallback(() => {
    setDraft(emptyDraft);
  }, []);

  const setAssignment = useCallback((slotId: string, playerId: number | null) => {
    setDraft((current) => {
      const next = { ...current.assignments };
      // clear previous slot of this player
      if (playerId !== null) {
        for (const [key, value] of Object.entries(next)) {
          if (value === playerId) {
            delete next[key];
          }
        }
        next[slotId] = playerId;
      } else {
        delete next[slotId];
      }
      return { ...current, assignments: next };
    });
  }, []);

  const value = useMemo(
    () => ({ draft, updateDraft, resetDraft, setAssignment }),
    [draft, updateDraft, resetDraft, setAssignment],
  );

  return (
    <TeamCreateContext.Provider value={value}>{children}</TeamCreateContext.Provider>
  );
}

export function useTeamCreate() {
  const context = useContext(TeamCreateContext);
  if (!context) {
    throw new Error('useTeamCreate must be used within TeamCreateProvider');
  }
  return context;
}
