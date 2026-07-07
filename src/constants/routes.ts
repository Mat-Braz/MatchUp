export const routeGroups = {
  auth: '(auth)',
  protected: '(protected)',
  tabs: '(tabs)',
  championships: 'championships',
  chat: 'chat',
  athlete: 'athlete',
  institution: 'institution',
} as const;

export const mainTabs = [
  { key: 'home', label: 'Inicio' },
  { key: 'explore', label: 'Explorar' },
  { key: 'contacts', label: 'Conversas' },
  { key: 'notifications', label: 'Avisos' },
  { key: 'profile', label: 'Perfil' },
] as const;
