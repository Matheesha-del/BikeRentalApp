import { Stack, useLocalSearchParams, Link } from 'expo-router';
import SelectedBicycleSheet from '~/components/SelectedBicycleSheet';
import Map from '~/components/Map';

import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';

export default function Details() {
  const { name } = useLocalSearchParams();

  return (
    <>
      <Stack.Screen options={{ title: 'Home', headerShown: false }} />
      <Map />
      <SelectedBicycleSheet/>
    </>
  );
}
