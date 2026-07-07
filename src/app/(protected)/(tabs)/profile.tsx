import { EmptyState, ProtectedCanvas, ScreenTitle } from '@/components/layout/PencilProtected';

export default function ProfileScreen() {
  return (
    <ProtectedCanvas active="Perfil">
      <ScreenTitle>Perfil</ScreenTitle>
      <EmptyState top={145} title="Perfil ainda vazio" message="Quando você completar seus dados, suas informações e atalhos aparecerão aqui." />
    </ProtectedCanvas>
  );
}
