import { Link } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function FeedScreen() {
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.feedColumn}>
        <View style={styles.header}>
          <Text style={styles.kicker}>SORI FEED</Text>
          <Text style={styles.title}>Newest stories from the Sori universe.</Text>
          <Text style={styles.subtitle}>
            Your feed will show posts, photos, videos, profile drops, and creator updates from the
            people and brands you follow.
          </Text>
        </View>

        <View style={styles.composerPrompt}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>S</Text>
          </View>
          <View style={styles.promptCopy}>
            <Text style={styles.promptTitle}>No posts yet.</Text>
            <Text style={styles.promptText}>Create the first Sori post or follow profiles as they join.</Text>
          </View>
          <Link href="/create-post" asChild>
            <Pressable style={styles.promptButton}>
              <Text style={styles.promptButtonText}>Create</Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.emptyFeed}>
          <View style={styles.emptyVisualizer}>
            <View style={styles.feedCardGhost} />
            <View style={styles.feedCardGhostSmall} />
          </View>
          <Text style={styles.emptyTitle}>The feed is quiet for now.</Text>
          <Text style={styles.emptyText}>
            Once people start posting, this page becomes the living front door of Sori: updates,
            media, reels, and profile launches in one stream.
          </Text>
        </View>
      </View>

      <View style={styles.rightRail}>
        <Text style={styles.panelTitle}>Today on Sori</Text>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>0</Text>
          <Text style={styles.metricLabel}>new posts</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>0</Text>
          <Text style={styles.metricLabel}>new creators</Text>
        </View>
        <Link href="/market" asChild>
          <Pressable style={styles.marketButton}>
            <Text style={styles.marketButtonText}>Browse Designer Market</Text>
          </Pressable>
        </Link>
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
    paddingLeft: 174,
    paddingRight: 12,
    paddingTop: 28,
    paddingBottom: 40,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 22,
  },
  feedColumn: {
    flex: 1,
    minWidth: 0,
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
    color: '#67e8f9',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.7,
  },
  title: {
    color: '#ffffff',
    fontSize: 34,
    lineHeight: 39,
    fontWeight: '900',
    marginTop: 10,
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 12,
  },
  composerPrompt: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(15,23,42,0.86)',
    padding: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  avatarText: {
    color: '#050509',
    fontSize: 22,
    fontWeight: '900',
  },
  promptCopy: {
    flex: 1,
  },
  promptTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  promptText: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },
  promptButton: {
    height: 42,
    borderRadius: 14,
    paddingHorizontal: 17,
    backgroundColor: '#ff3cbf',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  promptButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  emptyFeed: {
    alignItems: 'center',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#0b1120',
    padding: 28,
  },
  emptyVisualizer: {
    width: '100%',
    maxWidth: 480,
    height: 240,
    borderRadius: 24,
    backgroundColor: '#070712',
    borderWidth: 1,
    borderColor: 'rgba(255,60,191,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  feedCardGhost: {
    width: '72%',
    height: 118,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
  },
  feedCardGhostSmall: {
    position: 'absolute',
    width: '42%',
    height: 78,
    right: 42,
    bottom: 42,
    borderRadius: 18,
    backgroundColor: 'rgba(34,211,238,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(103,232,249,0.35)',
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 22,
    textAlign: 'center',
  },
  emptyText: {
    color: '#a8b3c4',
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 560,
    marginTop: 8,
    textAlign: 'center',
  },
  rightRail: {
    display: 'none',
    width: 280,
    flexGrow: 1,
    maxWidth: 360,
    alignSelf: 'flex-start',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#0f172a',
    padding: 18,
    gap: 12,
  },
  panelTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  metric: {
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 14,
  },
  metricValue: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
  },
  metricLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
  },
  marketButton: {
    borderRadius: 16,
    minHeight: 48,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  marketButtonText: {
    color: '#050509',
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
});
