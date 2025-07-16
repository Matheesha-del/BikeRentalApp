import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import { Button } from './Button';
import {Text, View, Image} from 'react-native';
import { useEffect, useRef } from 'react';
import { Alert, Modal, Pressable } from 'react-native';
import { useState } from 'react';
import { BicycleProvider } from '~/providers/BicycleProvider';
import { useBicycle } from '~/providers/BicycleProvider';
import bicycle from '~/assets/bicycle.png';
import pin from '~/assets/pin.png';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Entypo from '@expo/vector-icons/Entypo';




export default function SelectedBicycleSheet() {
    const {selectedBicycle, distance, duration, isNearby } = useBicycle();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [journeyStarted, setJourneyStarted] = useState(false);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [showSummary, setShowSummary] = useState(false);
    const [showPayment, setShowPayment] = useState(false);

    const rideMinutes = Math.floor(elapsedTime / 60);
    const charge = rideMinutes >= 20 ? 500 : 100;



    const handleStartJourney = () => {
    Alert.alert(
      "Confirm Ride",
      "Are you sure that you want to start the ride?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => {
            setJourneyStarted(true);
            setStartTime(new Date());
            
          },
        },
      ]
    );
  };

  const handleEndTrip = () => {
  setJourneyStarted(false);
  setShowSummary(true);
};


  useEffect(() => {
  if (selectedBicycle) {
    // Reset all states before expanding the bottom sheet
    setJourneyStarted(false);
    setStartTime(null);
    setElapsedTime(0);
    setShowSummary(false);
    setShowPayment(false);
  }
}, [selectedBicycle]);






    useEffect(() => {
  if (selectedBicycle) {
    // Delay bottom sheet expansion slightly
    setTimeout(() => {
      bottomSheetRef.current?.expand();
    }, 50); // 50ms is enough
  }
}, [selectedBicycle]);


    useEffect(() => {
  let timer: NodeJS.Timer;
  if (journeyStarted && startTime) {
    timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);
  } else {
    setElapsedTime(0);
  }

  return () => clearInterval(timer);
}, [journeyStarted, startTime]);

    


    return(
      <>
        <BottomSheet ref={bottomSheetRef} 
        index={-1} 
        //enableDynamicSizing
        snapPoints={[200]} 
        enablePanDownToClose
        backgroundStyle={{backgroundColor:'#414442'}}>
        {selectedBicycle && <BottomSheetView style={{ flex: 1, padding:10 }} >
          <View style={{flexDirection:'row', alignItems:'center', gap:10}}>
            <Image source={pin} style={{width: 80, height: 80,  backgroundColor: 'transparent' }} />
          <View style={{ flex: 1 ,gap: 5}}>
            
            <Text style={{color:'white', fontSize:20, fontWeight:'600'}}>ECO-FRIENDLY BICYCLE</Text>
            <Text style={{color:'gray', fontSize:18}}>
              id-{selectedBicycle?.id}.  University of Moratuwa</Text>
          </View>
          <View style={{gap:5}}>
              <View 
            style={{flexDirection:'row', alignItems:'center', gap:5, alignSelf:'flex-start'}}>
              <MaterialCommunityIcons name="map-marker-distance" size={24} color="#59e8f1" />
              <Text style={{color:'white', fontSize:16, fontWeight:'200'}}>
                {(distance)?.toFixed(1) ?? '...'}m
              </Text>

            </View>

            <View 
            style={{flexDirection:'row', alignItems:'center', gap:5, alignSelf:'flex-start'}}>
              <Entypo name="time-slot" size={24} color="#59e8f1" />
              <Text style={{color:'white', fontSize:16, fontWeight:'200'}}>
                {((duration)/60)?.toFixed(1) ?? '...'}min
              </Text>

            </View>



          </View>
          
              
          </View>


          <View style={{flexDirection:'row', alignItems:'center', gap: 20}}>
          <Button title="Navigate"/>
          {!journeyStarted ? (
            <Button 
              title="Start Journey" 
              disabled={!isNearby}
              onPress={handleStartJourney} 
            />
          ) : (
            <>
              <Button title="End Trip" onPress={handleEndTrip} />
              <View style={{ backgroundColor: '#0ebdc0', padding: 12, borderRadius: 24 }}>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                  ⏱ {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
                </Text>
              </View>
            </>
          )}
        </View>
          
        </BottomSheetView>}

      </BottomSheet>
          

      <Modal visible={showSummary} transparent animationType="fade">
            <View style={{ flex: 1, backgroundColor: '#000000aa', justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 12, width: '80%' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Trip Summary</Text>
                <Text>Time: {rideMinutes}m {elapsedTime % 60}s</Text>
                <Text>Charge: LKR {charge}</Text>
                <View style={{ marginTop: 20 }}>
                  <Button title="Pay" onPress={() => {
                    setShowSummary(false);
                    setShowPayment(true);
                  }} />
                </View>
              </View>
            </View>
          </Modal>
      
      <Modal visible={showPayment} transparent animationType="fade">
  <View style={{ flex: 1, backgroundColor: '#000000aa', justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 12, width: '80%' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Select Payment Method</Text>

      <View style={{ gap: 10 }}>
        <Button 
          title="VISA" 
          onPress={() => {
            setShowPayment(false);
            setElapsedTime(0);
            setStartTime(null);
          }} 
        />

        <Button 
          title="Top-up Card" 
          onPress={() => {
            setShowPayment(false);
            setElapsedTime(0);
            setStartTime(null);
          }} 
        />
      </View>

      <Pressable style={{ marginTop: 10, alignSelf: 'center' }} onPress={() => setShowPayment(false)}>
        <Text style={{ color: 'blue', marginTop: 10 }}>Cancel</Text>
      </Pressable>
    </View>
  </View>
</Modal>
</>
    );
    
};

    

    



