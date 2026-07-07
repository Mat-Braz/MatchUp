import { Chips, EmptyState, ProtectedCanvas, ScreenTitle, SearchBox } from '@/components/layout/PencilProtected';

export default function ExploreScreen() {
  return (
    <ProtectedCanvas active="Explorar">
      <ScreenTitle>Explorar</ScreenTitle>
      <SearchBox placeholder="Buscar campeonatos..." />
      <Chips items={['Todos', 'Próximos', 'Em andamento', 'Encerrados']} top={166} />
      <EmptyState top={230} title="Nada para explorar ainda" message="Campeonatos publicados aparecerão aqui quando forem criados." />
    </ProtectedCanvas>
  );
}
