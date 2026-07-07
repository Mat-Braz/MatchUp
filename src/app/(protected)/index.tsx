import { Redirect, type Href } from 'expo-router';

const homeRoute = '/(protected)/(tabs)/home' as Href;

export default function ProtectedIndex() {
  return <Redirect href={homeRoute} />;
}
