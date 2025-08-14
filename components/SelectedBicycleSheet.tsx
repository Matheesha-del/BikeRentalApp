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

// ✅ Firebase imports
import { getDatabase, ref, get, update } from 'firebase/database';
import { database } from '~/utils/firebase'; // your firebase init file
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SelectedBicycleSheet() {
  const {
    selectedBicycle,
    distance,
    duration,
    isNearby,
    isOutsideGeofence,
    isBikeInStation,
    startNavigation,
  } = useBicycle();

  const bottomSheetRef = useRef<BottomSheet>(null);

  const [journeyStarted, setJourneyStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [finalElapsedTime, setFinalElapsedTime] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [rfid, setRfid] = useState<string | null>(null);

  // Fetch RFID from AsyncStorage once on mount
  useEffect(() => {
    const fetchRFID = async () => {
      const storedRFID = await AsyncStorage.getItem('currentRFID');
      setRfid(storedRFID);
    };
    fetchRFID();
  }, []);

  const rideMinutes = Math.floor(elapsedTime / 60);
  const charge = rideMinutes < 20 ? 50 : 50 + (rideMinutes - 20) * 2;

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

  // Reset when bike changes
  useEffect(() => {
    if (selectedBicycle) {
      setJourneyStarted(false);
      setStartTime(null);
      setElapsedTime(0);
      setShowSummary(false);
      setShowPayment(false);
    }
  }, [selectedBicycle]);

  // Geofence warning with vibration
  useEffect(() => {
    if (journeyStarted && isOutsideGeofence) {
      setShowWarning(true);
      Vibration.vibrate([0, 1000, 1000], true);
    } else {
      setShowWarning(false);
      Vibration.cancel();
    }
  }, [journeyStarted, isOutsideGeofence]);

  // Timer
  useEffect(() => {
    let timer: NodeJS.Timer | undefined;
    if (journeyStarted && startTime) {
      timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => timer && clearInterval(timer);
  }, [journeyStarted, startTime]);

  // Auto expand bottom sheet
  useEffect(() => {
    if (selectedBicycle) {
      setTimeout(() => bottomSheetRef.current?.expand(), 50);
    }
  }, [selectedBicycle]);

  // Handle Top-up Card Payment
  const handleTopUpPayment = async () => {
    if (!rfid) {
      Alert.alert('Error', 'RFID not found. Please login again.');
      return;
    }

    try {
      const rfidRef = ref(database, `rfid_users/${rfid}`);
      const snapshot = await get(rfidRef);

      if (snapshot.exists()) {
        const currentValue = snapshot.val().value || 0;
        const newBalance = currentValue - charge;

        if (newBalance < 0) {
          Alert.alert('Insufficient Balance', 'Please recharge your card.');
          return;
        }

        await update(rfidRef, { value: newBalance });

        setBalance(newBalance);
        Alert.alert(
          'Payment Successful',
          `Amount Spent: LKR ${charge}\nCurrent Balance: LKR ${newBalance}`
        );
      } else {
        Alert.alert('User Not Found', 'RFID record not found in database.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong with payment.');
      console.error(error);
    } finally {
      setShowPayment(false);
      setElapsedTime(0);
      setStartTime(null);
    }
  };

  return (
    <>
      {/* Geofence Warning */}
      <Modal visible={showWarning} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>⚠️ Warning</Text>
            <Text style={styles.text}>
              You have moved outside the allowed riding area. Please return to the
              designated zone!
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
                  <MaterialCommunityIcons
                    name="map-marker-distance"
                    size={24}
                    color="#59e8f1"
                  />
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

            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 10 }}
            >
              <Button title="Navigate" onPress={startNavigation} />

              {!journeyStarted ? (
                <Button
                  title="Start Journey"
                  disabled={!isBikeInStation}
                  onPress={handleStartJourney}
                />
              ) : (
                <>
                  <Button title="End Trip" onPress={handleEndTrip} />
                  <View
                    style={{ backgroundColor: '#0ebdc0', padding: 12, borderRadius: 24 }}
                  >
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

      {/* Trip Summary */}
      <Modal visible={showSummary} transparent animationType="fade">
        <View style={styles.backdrop}>
          <View style={styles.popup}>
            <Text style={styles.summaryTitle}>Trip Summary</Text>
            <Text>
              Time: {Math.floor(finalElapsedTime / 60)}m {finalElapsedTime % 60}s
            </Text>
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

      {/* Payment Options */}
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
              <Button title="Top-up Card" onPress={handleTopUpPayment} />
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
