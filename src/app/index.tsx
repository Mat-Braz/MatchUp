import { Redirect } from 'expo-router';

import { authRoutes } from '@/constants/authRoutes';

export default function IndexRoute() {
  return <Redirect href={authRoutes.splash} />;
}
