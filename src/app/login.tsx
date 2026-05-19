import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { getIdentityFromMetadata } from '@/lib/identity';
import { getSupabase } from '@/lib/supabase';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleLogin() {
    setError('');
    setMessage('');

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError('Enter your email and password to log in.');
      return;
    }

    setIsLoading(true);

    let loginError: Error | null = null;

    try {
      const { data, error } = await getSupabase().auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      loginError = error;
      if (!error) {
        const identity = getIdentityFromMetadata(data?.user?.user_metadata);
        router.replace(identity.handle ? '/' : '/claim-handle');
        return;
      }
    } catch (caughtError) {
      loginError = caughtError instanceof Error ? caughtError : new Error('Could not log in.');
    }

    setIsLoading(false);

    if (loginError) {
      setError(loginError.message);
      return;
    }

    router.replace('/claim-handle');
  }

  return (
    <View style={styles.page}>
      <View style={styles.card}>
        <Text style={styles.kicker}>WELCOME BACK</Text>
        <Text style={styles.title}>Log in to Sori.</Text>
        <Text style={styles.subtitle}>
          Use the email and password you verified through Supabase Auth.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#64748b"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          inputMode="email"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#64748b"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="current-password"
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {message ? <Text style={styles.successText}>{message}</Text> : null}

        <Pressable
          style={[styles.primaryButton, isLoading && styles.disabledButton]}
          onPress={handleLogin}
          disabled={isLoading}>
          <Text style={styles.primaryButtonText}>{isLoading ? 'Logging in...' : 'Log in'}</Text>
        </Pressable>

        <Link href="/signup" asChild>
          <Pressable style={styles.textButton}>
            <Text style={styles.textButtonText}>New to Sori? Create an account</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    minHeight: 720,
    backgroundColor: '#050509',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    borderRadius: 24,
    padding: 26,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  kicker: {
    color: '#a5b4fc',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.7,
  },
  title: {
    color: '#ffffff',
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '900',
    marginTop: 12,
  },
  subtitle: {
    color: '#a8b3c4',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 22,
  },
  input: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#263244',
    color: '#ffffff',
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  primaryButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  disabledButton: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: '#050509',
    fontSize: 16,
    fontWeight: '900',
  },
  errorText: {
    color: '#fda4af',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  successText: {
    color: '#86efac',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  textButton: {
    alignItems: 'center',
    paddingTop: 18,
  },
  textButtonText: {
    color: '#c4b5fd',
    fontSize: 14,
    fontWeight: '800',
  },
});
