export type SquadSize = 5 | 11;

export type FormationSlot = {
  id: string;
  label: string;
  /** 0–100 from left */
  x: number;
  /** 0–100 from top (attacking toward top of pitch UI) */
  y: number;
};

export type FormationDefinition = {
  id: string;
  name: string;
  slots: FormationSlot[];
};

/** Futsal / society — GK + 4 */
export const FUTSAL_FORMATIONS: FormationDefinition[] = [
  {
    id: '1-2-1',
    name: '1-2-1',
    slots: [
      { id: 'GK', label: 'GOL', x: 50, y: 90 },
      { id: 'FIX', label: 'FIX', x: 50, y: 68 },
      { id: 'ALA_E', label: 'ALA', x: 22, y: 48 },
      { id: 'ALA_D', label: 'ALA', x: 78, y: 48 },
      { id: 'PIV', label: 'PIV', x: 50, y: 22 },
    ],
  },
  {
    id: '2-2',
    name: '2-2',
    slots: [
      { id: 'GK', label: 'GOL', x: 50, y: 90 },
      { id: 'ZAG_E', label: 'ZAG', x: 32, y: 65 },
      { id: 'ZAG_D', label: 'ZAG', x: 68, y: 65 },
      { id: 'ATA_E', label: 'ATA', x: 32, y: 28 },
      { id: 'ATA_D', label: 'ATA', x: 68, y: 28 },
    ],
  },
  {
    id: '1-1-2',
    name: '1-1-2',
    slots: [
      { id: 'GK', label: 'GOL', x: 50, y: 90 },
      { id: 'FIX', label: 'FIX', x: 50, y: 68 },
      { id: 'MEI', label: 'MEI', x: 50, y: 45 },
      { id: 'ATA_E', label: 'ATA', x: 30, y: 22 },
      { id: 'ATA_D', label: 'ATA', x: 70, y: 22 },
    ],
  },
  {
    id: '2-1-1',
    name: '2-1-1',
    slots: [
      { id: 'GK', label: 'GOL', x: 50, y: 90 },
      { id: 'ZAG_E', label: 'ZAG', x: 32, y: 68 },
      { id: 'ZAG_D', label: 'ZAG', x: 68, y: 68 },
      { id: 'MEI', label: 'MEI', x: 50, y: 42 },
      { id: 'PIV', label: 'PIV', x: 50, y: 20 },
    ],
  },
  {
    id: '1-3',
    name: '1-3',
    slots: [
      { id: 'GK', label: 'GOL', x: 50, y: 90 },
      { id: 'FIX', label: 'FIX', x: 50, y: 62 },
      { id: 'ALA_E', label: 'ALA', x: 20, y: 32 },
      { id: 'PIV', label: 'PIV', x: 50, y: 22 },
      { id: 'ALA_D', label: 'ALA', x: 80, y: 32 },
    ],
  },
];

/** Campo — GK + 10 */
export const FIELD_FORMATIONS: FormationDefinition[] = [
  {
    id: '4-4-2',
    name: '4-4-2',
    slots: [
      { id: 'GK', label: 'GOL', x: 50, y: 92 },
      { id: 'LD', label: 'LD', x: 88, y: 72 },
      { id: 'ZAG_D', label: 'ZAG', x: 62, y: 75 },
      { id: 'ZAG_E', label: 'ZAG', x: 38, y: 75 },
      { id: 'LE', label: 'LE', x: 12, y: 72 },
      { id: 'MD', label: 'MD', x: 82, y: 48 },
      { id: 'VOL_D', label: 'VOL', x: 58, y: 52 },
      { id: 'VOL_E', label: 'VOL', x: 42, y: 52 },
      { id: 'ME', label: 'ME', x: 18, y: 48 },
      { id: 'ATA_D', label: 'ATA', x: 62, y: 22 },
      { id: 'ATA_E', label: 'ATA', x: 38, y: 22 },
    ],
  },
  {
    id: '4-3-3',
    name: '4-3-3',
    slots: [
      { id: 'GK', label: 'GOL', x: 50, y: 92 },
      { id: 'LD', label: 'LD', x: 88, y: 72 },
      { id: 'ZAG_D', label: 'ZAG', x: 62, y: 75 },
      { id: 'ZAG_E', label: 'ZAG', x: 38, y: 75 },
      { id: 'LE', label: 'LE', x: 12, y: 72 },
      { id: 'VOL', label: 'VOL', x: 50, y: 55 },
      { id: 'MC_D', label: 'MC', x: 68, y: 42 },
      { id: 'MC_E', label: 'MC', x: 32, y: 42 },
      { id: 'PD', label: 'PD', x: 82, y: 20 },
      { id: 'CA', label: 'CA', x: 50, y: 18 },
      { id: 'PE', label: 'PE', x: 18, y: 20 },
    ],
  },
  {
    id: '3-5-2',
    name: '3-5-2',
    slots: [
      { id: 'GK', label: 'GOL', x: 50, y: 92 },
      { id: 'ZAG_D', label: 'ZAG', x: 72, y: 75 },
      { id: 'ZAG_C', label: 'ZAG', x: 50, y: 78 },
      { id: 'ZAG_E', label: 'ZAG', x: 28, y: 75 },
      { id: 'ALA_D', label: 'ALA', x: 90, y: 48 },
      { id: 'VOL_D', label: 'VOL', x: 62, y: 52 },
      { id: 'VOL_C', label: 'VOL', x: 50, y: 45 },
      { id: 'VOL_E', label: 'VOL', x: 38, y: 52 },
      { id: 'ALA_E', label: 'ALA', x: 10, y: 48 },
      { id: 'ATA_D', label: 'ATA', x: 62, y: 20 },
      { id: 'ATA_E', label: 'ATA', x: 38, y: 20 },
    ],
  },
  {
    id: '4-2-3-1',
    name: '4-2-3-1',
    slots: [
      { id: 'GK', label: 'GOL', x: 50, y: 92 },
      { id: 'LD', label: 'LD', x: 88, y: 72 },
      { id: 'ZAG_D', label: 'ZAG', x: 62, y: 75 },
      { id: 'ZAG_E', label: 'ZAG', x: 38, y: 75 },
      { id: 'LE', label: 'LE', x: 12, y: 72 },
      { id: 'VOL_D', label: 'VOL', x: 60, y: 55 },
      { id: 'VOL_E', label: 'VOL', x: 40, y: 55 },
      { id: 'MEI_D', label: 'MEI', x: 78, y: 35 },
      { id: 'MEI_C', label: 'MEI', x: 50, y: 32 },
      { id: 'MEI_E', label: 'MEI', x: 22, y: 35 },
      { id: 'CA', label: 'CA', x: 50, y: 16 },
    ],
  },
  {
    id: '3-4-3',
    name: '3-4-3',
    slots: [
      { id: 'GK', label: 'GOL', x: 50, y: 92 },
      { id: 'ZAG_D', label: 'ZAG', x: 72, y: 75 },
      { id: 'ZAG_C', label: 'ZAG', x: 50, y: 78 },
      { id: 'ZAG_E', label: 'ZAG', x: 28, y: 75 },
      { id: 'MD', label: 'MD', x: 85, y: 48 },
      { id: 'VOL_D', label: 'VOL', x: 58, y: 50 },
      { id: 'VOL_E', label: 'VOL', x: 42, y: 50 },
      { id: 'ME', label: 'ME', x: 15, y: 48 },
      { id: 'PD', label: 'PD', x: 80, y: 20 },
      { id: 'CA', label: 'CA', x: 50, y: 16 },
      { id: 'PE', label: 'PE', x: 20, y: 20 },
    ],
  },
];

export function formationsForSquadSize(size: SquadSize): FormationDefinition[] {
  return size === 5 ? FUTSAL_FORMATIONS : FIELD_FORMATIONS;
}

export function getFormation(
  size: SquadSize,
  formationId: string,
): FormationDefinition {
  const list = formationsForSquadSize(size);
  return list.find((f) => f.id === formationId) ?? list[0];
}
