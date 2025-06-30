import { Stack, useLocalSearchParams } from 'expo-router';
import Map from '~/components/Map'
import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';

export default function Details() {
  const { name } = useLocalSearchParams();

  return (
    <>
      <Stack.Screen options={{ title: 'Details' }} />
      <Map />
    </>
  );
}
