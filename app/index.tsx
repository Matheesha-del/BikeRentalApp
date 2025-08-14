import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, Alert, Image } from 'react-native';
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { ref, get, query, orderByChild, equalTo } from "firebase/database";
import { auth, database } from '~/utils/firebase';
import { Button } from '~/components/Button';
import { Container } from '~/components/Container';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Query the database for matching RFID linked to email
      const rfidRef = query(
        ref(database, "rfid_users"),
        orderByChild("email"),
        equalTo(email)
      );

      const snapshot = await get(rfidRef);

      if (snapshot.exists()) {
        const rfidData = snapshot.val();
        const rfidKey = Object.keys(rfidData)[0]; // RFID number
        const userData = rfidData[rfidKey];

        // Save RFID for later use
        await AsyncStorage.setItem('currentRFID', rfidKey);

        Alert.alert('Login Successful', `Welcome ${userData.name || user.email}!`);
        console.log("RFID Linked Data:", { id: rfidKey, ...userData });

        router.replace('/details');
      } else {
        // No RFID linked → Sign out and block navigation
        await signOut(auth);
        Alert.alert(
          "RFID Not Linked",
          "Please contact the administrator to connect an RFID tag to your account."
        );
        return;
      }

    } catch (error) {
      Alert.alert('Login Failed', error.message);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Login' }} />
      <Container>
        <View style={styles.inputContainer}>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Image source={require('~/assets/pin.png')} style={{ width: 100, height: 100 }} />
          </View>
          <View>
            <Text style={{ fontSize: 28, fontWeight: 'bold' }}>
              Welcome to Bike Rental App.
            </Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />
          <Button title="Login" onPress={handleLogin} />
          <Text style={{ fontSize: 15 }}>Don't have an account? Sign Up.</Text>
          <Button title="Sign Up" onPress={() => router.push('./signup')} />
        </View>
      </Container>
    </>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 20,
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    backgroundColor: 'white',
  },
});
