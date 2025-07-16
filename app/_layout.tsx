import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import { BicycleProvider } from '~/providers/BicycleProvider';



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
