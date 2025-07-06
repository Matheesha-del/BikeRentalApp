import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, Alert } from 'react-native';
import { Stack , Link } from 'expo-router';
import { Button } from '~/components/Button';
import { Container } from '~/components/Container';

export default function Home() {
    return (
    <>
      <Stack.Screen options={{ title: 'Home' }} />
      <Container>
        <View>
            <Link href={{ pathname: '/details', params: { name: 'Dan' } }} asChild>
            <Button title="Show Details" />
            </Link>
        </View>
      </Container>
      
        </>
    );
}

const styles = StyleSheet.create({

    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
    },
}); 