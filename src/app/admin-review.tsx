import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { readProfileReports, type ProfileReport } from '@/lib/profile-security';

export default function AdminReviewScreen() {
  const [reports, setReports] = useState<ProfileReport[]>([]);

  useEffect(() => {
    setReports(readProfileReports());
  }, []);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.kicker}>LOCAL MODERATION</Text>
        <Text style={styles.title}>Admin review queue</Text>
        <Text style={styles.subtitle}>
          Localhost placeholder for profile reports. Production should move this to a protected
          admin route with Supabase roles and audited moderator actions.
        </Text>
      </View>

      {reports.length ? (
        <View style={styles.reportList}>
          {reports.map((report) => (
            <View key={report.id} style={styles.reportCard}>
              <Text style={styles.reportProfile}>{report.profileHandle}</Text>
              <Text style={styles.reportReason}>{report.reason.replace(/_/g, ' ')}</Text>
              <Text style={styles.reportDate}>{new Date(report.createdAt).toLocaleString()}</Text>
              <Pressable style={styles.reviewButton}>
                <Text style={styles.reviewButtonText}>Review placeholder</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No reports yet.</Text>
          <Text style={styles.emptyText}>Submitted reports from the profile page will appear here.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#050509' },
  content: {
    minHeight: '100%',
    paddingLeft: 184,
    paddingRight: 28,
    paddingTop: 34,
    paddingBottom: 44,
    gap: 18,
  },
  header: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#0f172a',
    padding: 24,
  },
  kicker: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.7,
  },
  title: {
    color: '#ffffff',
    fontSize: 38,
    lineHeight: 43,
    fontWeight: '900',
    marginTop: 8,
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 10,
    maxWidth: 720,
  },
  reportList: {
    gap: 12,
  },
  reportCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#0b1120',
    padding: 16,
  },
  reportProfile: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  reportReason: {
    color: '#fecaca',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 6,
    textTransform: 'capitalize',
  },
  reportDate: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 5,
  },
  reviewButton: {
    alignSelf: 'flex-start',
    minHeight: 38,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    marginTop: 12,
  },
  reviewButtonText: {
    color: '#050509',
    fontSize: 12,
    fontWeight: '900',
  },
  emptyCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#0b1120',
    padding: 20,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
});
