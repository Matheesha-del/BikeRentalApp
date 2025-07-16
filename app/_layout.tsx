import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import { BicycleProvider } from '~/providers/BicycleProvider';


import Mapbox from '@rnmapbox/maps';

Mapbox.setAccessToken('pk.eyJ1Ijoia2lzYWxpdCIsImEiOiJjbWNvYjJicHcxNjR0MmpxMDRlcHFsdTQ5In0.xiEjK5aFmYvv9Nleb3OPzg');

export default function Layout() {
  return (
  <GestureHandlerRootView style={{flex: 1 }}>
    <BicycleProvider>
      <Stack />
      <StatusBar style="light" />
    </BicycleProvider>
  </GestureHandlerRootView>
  
  );
}
