import { Slot } from 'expo-router';

import { RecoveryProvider } from '@/features/auth';

export default function RecoveryLayout() {
  return (
    <RecoveryProvider>
      <Slot />
    </RecoveryProvider>
  );
}
