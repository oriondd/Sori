import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { getSupabase } from '@/lib/supabase';

export default function SignupScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSignup() {
    setError('');
    setMessage('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = displayName.trim();

    if (!cleanName || !cleanEmail || !password) {
      setError('Add your name, email, and password to create your Sori profile.');
      return;
    }

    if (password.length < 8) {
      setError('Use at least 8 characters for your password.');
      return;
    }

    setIsLoading(true);

    let signupError: Error | null = null;

    try {
      const { error } = await getSupabase().auth.signUp({
      email: cleanEmail,
      password,
      options: {
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined,
        data: {
          display_name: cleanName,
        },
      },
      });
      signupError = error;
    } catch (caughtError) {
      signupError = caughtError instanceof Error ? caughtError : new Error('Could not create your account.');
    }

    setIsLoading(false);

    if (signupError) {
      setError(signupError.message);
      return;
    }

    setMessage(`Verification sent to ${cleanEmail}. Open the email and confirm your account.`);
    setPassword('');
  }

  return (
    <View style={styles.page}>
      <View style={styles.card}>
        <Text style={styles.kicker}>JOIN SORI</Text>
        <Text style={styles.title}>Create your profile canvas.</Text>
        <Text style={styles.subtitle}>
          Enter your details and Sori will send a verification email before your profile opens.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Display name"
          placeholderTextColor="#64748b"
          value={displayName}
          onChangeText={setDisplayName}
          autoCapitalize="words"
        />
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
          autoComplete="new-password"
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {message ? <Text style={styles.successText}>{message}</Text> : null}

        <Pressable
          style={[styles.primaryButton, isLoading && styles.disabledButton]}
          onPress={handleSignup}
          disabled={isLoading}>
          <Text style={styles.primaryButtonText}>
            {isLoading ? 'Sending verification...' : 'Create account'}
          </Text>
        </Pressable>

        <Link href="/login" asChild>
          <Pressable style={styles.textButton}>
            <Text style={styles.textButtonText}>Already have an account? Log in</Text>
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
    color: '#67e8f9',
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
    color: '#bae6fd',
    fontSize: 14,
    fontWeight: '800',
  },
});
