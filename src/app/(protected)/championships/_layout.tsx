import { Slot } from 'expo-router';

import { ChampionshipWizardProvider } from '@/features/championships';

export default function ChampionshipsLayout() {
  return (
    <ChampionshipWizardProvider>
      <Slot />
    </ChampionshipWizardProvider>
  );
}
