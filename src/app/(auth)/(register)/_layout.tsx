import { Slot } from 'expo-router';

import { RegisterProvider } from '@/features/auth';

export default function RegisterLayout() {
  return (
    <RegisterProvider>
      <Slot />
    </RegisterProvider>
  );
}
