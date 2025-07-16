import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '~/utils/firebase';
import { Button } from '~/components/Button';
import { Container } from '~/components/Container';
import { useRouter } from 'expo-router';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      Alert.alert('Success', `Account created for ${user.email}`);
      router.push('./details');
    } catch (error: any) {
      Alert.alert('Signup Error', error.message);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Sign Up' }} />
      <Container>
        <View style={styles.container}>
          <Text style={styles.title}>Create a New Account</Text>
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
          <Button title="Sign Up" onPress={handleSignUp} />
        </View>
      </Container>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 16,
  },
});
