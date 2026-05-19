import React from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

const themes = ['Neon Orbit', 'Glass Portfolio', 'Creator Shop'];

export default function DesignerMarketScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 900;

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={StyleSheet.flatten([
        styles.content,
        compact && styles.contentCompact,
      ])}>
      <Text style={styles.kicker}>DESIGNER MARKET</Text>
      <Text style={styles.title}>Profile designs creators can sell.</Text>
      <Text style={styles.subtitle}>
        This marketplace will let designers publish custom Sori layouts, live previews, and premium
        profile themes.
      </Text>

      <View style={styles.grid}>
        {themes.map((theme, index) => (
          <View key={theme} style={styles.card}>
            <View style={[styles.preview, index === 0 && styles.previewHot]} />
            <Text style={styles.cardTitle}>{theme}</Text>
            <Text style={styles.cardMeta}>Coming soon</Text>
          </View>
        ))}
      </View>
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
    paddingBottom: 40,
  },
  contentCompact: {
    paddingLeft: 18,
    paddingRight: 18,
    paddingTop: 92,
  },
  kicker: {
    color: '#67e8f9',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.7,
  },
  title: {
    color: '#ffffff',
    fontSize: 44,
    lineHeight: 49,
    fontWeight: '900',
    marginTop: 10,
    maxWidth: 720,
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 16,
    lineHeight: 25,
    marginTop: 12,
    maxWidth: 720,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 26,
  },
  card: {
    width: 260,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#0f172a',
    padding: 14,
  },
  preview: {
    height: 150,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  previewHot: {
    backgroundColor: 'rgba(255,60,191,0.2)',
    borderColor: '#ff3cbf',
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 14,
  },
  cardMeta: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
});
