import { EmptyState, MatchUpLogoHeader, ProtectedCanvas, SectionLabel } from '@/components/layout/PencilProtected';

export default function HomeScreen() {
  return (
    <ProtectedCanvas active="Início">
      <MatchUpLogoHeader />
      <SectionLabel top={155}>Campeonatos Recomendados</SectionLabel>
      <EmptyState top={190} title="Nenhum campeonato ainda" message="Quando houver campeonatos disponíveis, eles aparecerão aqui." />
      <SectionLabel top={455} action="+ Criar">Meus Campeonatos</SectionLabel>
      <EmptyState top={490} title="Você ainda não criou nada" message="Seus campeonatos criados ou participações ficarão nesta área." />
    </ProtectedCanvas>
  );
}
