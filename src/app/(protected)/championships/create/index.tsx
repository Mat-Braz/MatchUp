import { Redirect } from 'expo-router';

import { championshipRoutes } from '@/constants/championshipRoutes';

export default function CreateChampionshipIndex() {
  return <Redirect href={championshipRoutes.createStep(1) as never} />;
}
