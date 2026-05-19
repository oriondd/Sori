import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  formatHandle,
  getIdentityFromMetadata,
  getVerificationForHandle,
  isHandleClaimedLocally,
  normalizeHandle,
  rememberHandleLocally,
} from '@/lib/identity';
import { getSupabase } from '@/lib/supabase';

export default function ClaimHandleScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [handle, setHandle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadUser() {
      setIsLoading(true);
      const { data, error: userError } = await getSupabase().auth.getUser();
      const user = data?.user;

      if (userError || !user) {
        router.replace('/login');
        return;
      }

      const identity = getIdentityFromMetadata(user.user_metadata);

      if (identity.handle) {
        router.replace('/dashboard');
        return;
      }

      setUserId(user.id);
      setDisplayName(identity.displayName === 'Sori Creator' ? '' : identity.displayName);
      setHandle(isHandleClaimedLocally('sori', user.id) ? '' : 'Sori');
      setIsLoading(false);
    }

    loadUser();
  }, [router]);

  async function saveHandle() {
    setError('');

    const cleanHandle = normalizeHandle(handle);
    const cleanDisplayName = displayName.trim();

    if (!cleanDisplayName) {
      setError('Add the name people should see on your profile.');
      return;
    }

    if (cleanHandle.length < 3) {
      setError('Choose a handle with at least 3 letters, numbers, or underscores.');
      return;
    }

    if (isHandleClaimedLocally(cleanHandle, userId)) {
      setError(`${formatHandle(cleanHandle)} is already claimed on this device.`);
      return;
    }

    setIsSaving(true);

    const verification = getVerificationForHandle(cleanHandle);
    const { error: updateError } = await getSupabase().auth.updateUser({
      data: {
        display_name: cleanDisplayName,
        handle: cleanHandle,
        is_founder: verification.isFounder,
        verified_badge: verification.verifiedBadge || '',
      },
    });

    setIsSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    rememberHandleLocally(cleanHandle, userId);
    router.replace('/dashboard');
  }

  if (isLoading) {
    return (
      <View style={styles.page}>
        <Text style={styles.loadingText}>Loading identity setup...</Text>
      </View>
    );
  }

  const cleanHandle = normalizeHandle(handle);
  const founderPreview = cleanHandle === 'sori';

  return (
    <View style={styles.page}>
      <View style={styles.card}>
        <Text style={styles.kicker}>CLAIM YOUR IDENTITY</Text>
        <Text style={styles.title}>Choose your Sori handle.</Text>
        <Text style={styles.subtitle}>
          Every account needs a public handle before the profile opens. This becomes the identity
          people search, tag, and visit.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Display name"
          placeholderTextColor="#64748b"
          value={displayName}
          onChangeText={setDisplayName}
          autoCapitalize="words"
        />

        <View style={styles.handleInputRow}>
          <Text style={styles.atSymbol}>@</Text>
          <TextInput
            style={styles.handleInput}
            placeholder="handle"
            placeholderTextColor="#64748b"
            value={handle}
            onChangeText={setHandle}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.previewCard}>
          <View>
            <View style={styles.previewNameRow}>
              <Text style={styles.previewName}>{displayName.trim() || 'Your name'}</Text>
              {founderPreview ? (
                <View style={styles.goldBadge}>
                  <Text style={styles.goldBadgeText}>✓</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.previewHandle}>{formatHandle(cleanHandle)}</Text>
          </View>
          <Text style={styles.previewNote}>
            {founderPreview ? 'Founder verified account' : 'Public Sori profile identity'}
          </Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          style={[styles.primaryButton, isSaving && styles.disabledButton]}
          onPress={saveHandle}
          disabled={isSaving}>
          <Text style={styles.primaryButtonText}>{isSaving ? 'Saving...' : 'Claim handle'}</Text>
        </Pressable>
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
    maxWidth: 520,
    borderRadius: 26,
    padding: 26,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  kicker: {
    color: '#facc15',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.7,
  },
  title: {
    color: '#ffffff',
    fontSize: 38,
    lineHeight: 42,
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
  handleInputRow: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#263244',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  atSymbol: {
    color: '#facc15',
    fontSize: 19,
    fontWeight: '900',
    marginRight: 2,
  },
  handleInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    height: '100%',
  },
  previewCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(250,204,21,0.32)',
    backgroundColor: 'rgba(250,204,21,0.08)',
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  previewNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewName: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '900',
  },
  previewHandle: {
    color: '#fde68a',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 4,
  },
  previewNote: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 10,
  },
  goldBadge: {
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: '#facc15',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff7ad',
  },
  goldBadgeText: {
    color: '#451a03',
    fontSize: 14,
    fontWeight: '900',
  },
  primaryButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
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
    marginBottom: 12,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
});
