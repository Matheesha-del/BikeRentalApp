import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import {
  Text,
  View,
  Image,
  Alert,
  Modal,
  Pressable,
  Vibration,
  StyleSheet,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useBicycle } from '~/providers/BicycleProvider';
import { Button } from './Button';
import pin from '~/assets/pin.png';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Entypo from '@expo/vector-icons/Entypo';

export default function SelectedBicycleSheet() {
  const { selectedBicycle, distance, duration, isNearby, isOutsideGeofence } =
    useBicycle();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [journeyStarted, setJourneyStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [finalElapsedTime, setFinalElapsedTime] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const rideMinutes = Math.floor(elapsedTime / 60);
  const charge = rideMinutes >= 20 ? 500 : 100;

  const handleStartJourney = () => {
    Alert.alert('Confirm Ride', 'Are you sure you want to start the ride?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'OK',
        onPress: () => {
          setJourneyStarted(true);
          setStartTime(new Date());
        },
      },
    ]);
  };

  const handleEndTrip = () => {
    setFinalElapsedTime(elapsedTime);
    setJourneyStarted(false);
    setShowSummary(true);
  };

  useEffect(() => {
    if (selectedBicycle) {
      setJourneyStarted(false);
      setStartTime(null);
      setElapsedTime(0);
      setShowSummary(false);
      setShowPayment(false);
    }
  }, [selectedBicycle]);

  // Geofence warning
  useEffect(() => {
    if (journeyStarted && isOutsideGeofence) {
      setShowWarning(true);
      Vibration.vibrate([0, 1000, 1000], true); // Continuous vibration
    } else {
      setShowWarning(false);
      Vibration.cancel();
    }
  }, [journeyStarted, isOutsideGeofence]);

  // Timer
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

  // Auto expand sheet
  useEffect(() => {
    if (selectedBicycle) {
      setTimeout(() => bottomSheetRef.current?.expand(), 50);
    }
  }, [selectedBicycle]);

  return (
    <>
      {/* Geofence Warning Modal */}
      <Modal visible={showWarning} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>⚠️ Warning</Text>
            <Text style={styles.text}>
              You have moved outside the allowed riding area. Please return to the designated zone!
            </Text>
          </View>
        </View>
      </Modal>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={[200]}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: '#414442' }}
      >
        {selectedBicycle && (
          <BottomSheetView style={{ flex: 1, padding: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Image source={pin} style={{ width: 80, height: 80 }} />
              <View style={{ flex: 1, gap: 5 }}>
                <Text style={{ color: 'white', fontSize: 20, fontWeight: '600' }}>
                  ECO-FRIENDLY BICYCLE
                </Text>
                <Text style={{ color: 'gray', fontSize: 18 }}>
                  id-{selectedBicycle.id}. University of Moratuwa
                </Text>
              </View>

              <View style={{ gap: 5 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <MaterialCommunityIcons name="map-marker-distance" size={24} color="#59e8f1" />
                  <Text style={{ color: 'white', fontSize: 16 }}>
                    {distance?.toFixed(1) ?? '...'}m
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Entypo name="time-slot" size={24} color="#59e8f1" />
                  <Text style={{ color: 'white', fontSize: 16 }}>
                    {(duration / 60)?.toFixed(1) ?? '...'}min
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 10 }}>
              <Button title="Navigate" />
              {!journeyStarted ? (
                <Button title="Start Journey" disabled={!isNearby} onPress={handleStartJourney} />
              ) : (
                <>
                  <Button title="End Trip" onPress={handleEndTrip} />
                  <View style={{ backgroundColor: '#0ebdc0', padding: 12, borderRadius: 24 }}>
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                      ⏱ {rideMinutes}:{(elapsedTime % 60).toString().padStart(2, '0')}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </BottomSheetView>
        )}
      </BottomSheet>

      {/* Trip Summary Modal */}
      <Modal visible={showSummary} transparent animationType="fade">
        <View style={styles.backdrop}>
          <View style={styles.popup}>
            <Text style={styles.summaryTitle}>Trip Summary</Text>
            <Text>Time: {Math.floor(finalElapsedTime / 60)}m {finalElapsedTime % 60}s</Text>
            <Text>Charge: LKR {charge}</Text>
            <View style={{ marginTop: 20 }}>
              <Button
                title="Pay"
                onPress={() => {
                  setShowSummary(false);
                  setShowPayment(true);
                }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal visible={showPayment} transparent animationType="fade">
        <View style={styles.backdrop}>
          <View style={styles.popup}>
            <Text style={styles.summaryTitle}>Select Payment Method</Text>
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
            <Pressable onPress={() => setShowPayment(false)} style={{ marginTop: 10 }}>
              <Text style={{ color: 'blue', textAlign: 'center' }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

// Styles
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    width: '85%',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#d9534f',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
  backdrop: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    width: '80%',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
