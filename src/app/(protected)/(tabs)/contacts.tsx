import { Chips, EmptyState, ProtectedCanvas, ScreenTitle, SearchBox } from '@/components/layout/PencilProtected';

export default function ContactsScreen() {
  return (
    <ProtectedCanvas active="Chat">
      <ScreenTitle action="+">Contatos</ScreenTitle>
      <SearchBox placeholder="Buscar conversa..." />
      <Chips items={['Todos', 'Pessoas', 'Equipe', 'Campo', 'Grupos']} top={166} />
      <EmptyState top={230} title="Nenhuma conversa" message="Suas conversas e grupos aparecerão aqui depois que forem criados." />
    </ProtectedCanvas>
  );
}
