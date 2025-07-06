import { Stack, Link } from 'expo-router';
import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, Alert } from 'react-native';
import { FIREBASE_auth } from '~/utils/firebase';
import { NavigationContainer } from '@react-navigation/native';


import { Button } from '~/components/Button';
import { Container } from '~/components/Container';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
  //  try {
  //   const userCredential = await signInWithEmailAndPassword( FIREBASE_auth, email, password)
  //   const user = userCredential.user;
  //   Alert.alert('Login Successful', `Welcome back, ${user.email}!`);
  //  }catch (error:any) {
  //     Alert.alert('Login Failed', 'No user is logged in. Please check your credentials.');
  //     }
    // Replace this with your actual auth logic 
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Login' }} />
      <Container>
          <View style={styles.inputContainer}>
            <View>  
              <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Welcome to Bike Rental App. Please Login/Sign in to continue.</Text>
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
          <Link href="/home" style={{ marginTop: 10 }} asChild  >
          <Button title="Login" onPress={handleLogin} />
          </Link>
          <Button title="Sign Up" onPress={() => Alert.alert('Sign Up', 'Sign Up functionality not implemented yet.')} />
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
  },
});