import { Link, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { getIdentityFromMetadata, type SoriIdentity } from '@/lib/identity';
import { getSupabase } from '@/lib/supabase';

const setupSteps = [
  {
    title: 'Claim your Sori handle',
    detail: 'Choose the public name visitors will use to find your profile.',
    status: 'Next',
  },
  {
    title: 'Design your profile canvas',
    detail: 'Pick a starter layout, then customize colors, media, and sections.',
    status: 'Draft',
  },
  {
    title: 'Build your clickable grid',
    detail: 'Add friends, products, booking links, drops, or portfolio blocks.',
    status: 'Draft',
  },
];

export default function DashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [identity, setIdentity] = useState<SoriIdentity | null>(null);
  const compact = width < 900;

  useEffect(() => {
    async function requireHandle() {
      const { data } = await getSupabase().auth.getUser();
      const user = data?.user;

      if (!user) {
        router.replace('/login');
        return;
      }

      const currentIdentity = getIdentityFromMetadata(user.user_metadata);

      if (!currentIdentity.handle) {
        router.replace('/claim-handle');
        return;
      }

      setIdentity(currentIdentity);
    }

    requireHandle();
  }, [router]);

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={StyleSheet.flatten([
        styles.content,
        compact && styles.contentCompact,
      ])}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>SORI DASHBOARD</Text>
          <Text style={styles.title}>Welcome to your profile studio.</Text>
          <Text style={styles.subtitle}>
            {identity?.handle
              ? `${identity.displayName} ${identity.isFounder ? 'is founder verified' : 'is live'} as @${identity.handle}.`
              : 'Your account is active.'}{' '}
            This is the control room for your profile, media, grid, and theme settings.
          </Text>
        </View>

        <Link href="/my-profile" asChild>
          <Pressable style={styles.previewButton}>
            <Text style={styles.previewButtonText}>View profile</Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>FREE</Text>
          <Text style={styles.statLabel}>Current tier</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Profile views</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Grid links</Text>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Profile launch checklist</Text>
        <View style={styles.steps}>
          {setupSteps.map((step) => (
            <View key={step.title} style={styles.stepCard}>
              <View style={styles.stepCopy}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDetail}>{step.detail}</Text>
              </View>
              <Text style={styles.stepStatus}>{step.status}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Coming next</Text>
        <Text style={styles.panelText}>
          We will connect this dashboard to Supabase profile rows, then add the profile editor,
          media uploads, and the public profile route.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#050509',
  },
  content: {
    minHeight: '100%',
    paddingLeft: 184,
    paddingRight: 28,
    paddingTop: 34,
    paddingBottom: 44,
    gap: 20,
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
  },
  contentCompact: {
    paddingLeft: 18,
    paddingRight: 18,
    paddingTop: 92,
  },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 18,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#0f172a',
    padding: 24,
  },
  kicker: {
    color: '#67e8f9',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.7,
  },
  title: {
    color: '#ffffff',
    fontSize: 42,
    lineHeight: 47,
    fontWeight: '900',
    marginTop: 10,
    maxWidth: 680,
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 16,
    lineHeight: 25,
    marginTop: 12,
    maxWidth: 680,
  },
  previewButton: {
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  previewButtonText: {
    color: '#050509',
    fontSize: 14,
    fontWeight: '900',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  statCard: {
    flex: 1,
    minWidth: 210,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(15,23,42,0.86)',
    padding: 20,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '900',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 6,
  },
  panel: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#0b1120',
    padding: 20,
  },
  panelTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
  },
  panelText: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 10,
  },
  steps: {
    gap: 12,
    marginTop: 16,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    padding: 16,
  },
  stepCopy: {
    flex: 1,
  },
  stepTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  stepDetail: {
    color: '#a8b3c4',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
  stepStatus: {
    color: '#050509',
    backgroundColor: '#67e8f9',
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 11,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: '900',
  },
});
