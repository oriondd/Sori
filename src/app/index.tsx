import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CurrentIdentityBadge, IdentityBadge } from '@/components/identity-badge';
import { POSTS_CHANGED_EVENT, readPosts, type SoriPost, visibilityLabels } from '@/lib/posts';

function WebFeedVideo({ uri }: { uri: string }) {
  if (Platform.OS !== 'web') {
    return null;
  }

  return React.createElement('video', {
    src: uri,
    controls: true,
    playsInline: true,
    style: {
      width: '100%',
      maxHeight: 520,
      objectFit: 'cover',
      borderRadius: 18,
      backgroundColor: '#050509',
    },
  });
}

function formatPostTime(value: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return 'just now';
  }
}

export default function FeedScreen() {
  const [posts, setPosts] = useState<SoriPost[]>([]);

  useEffect(() => {
    function refreshPosts() {
      setPosts(readPosts());
    }

    refreshPosts();

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener(POSTS_CHANGED_EVENT, refreshPosts);
      window.addEventListener('storage', refreshPosts);
      return () => {
        window.removeEventListener(POSTS_CHANGED_EVENT, refreshPosts);
        window.removeEventListener('storage', refreshPosts);
      };
    }

    return undefined;
  }, []);

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
          <CurrentIdentityBadge size="md" />
          <View style={styles.promptCopy}>
            <Text style={styles.promptTitle}>{posts.length ? 'Create another post.' : 'No posts yet.'}</Text>
            <Text style={styles.promptText}>
              {posts.length
                ? 'Share a thought, photo, video, or profile update with the Sori feed.'
                : 'Create the first Sori post or follow profiles as they join.'}
            </Text>
          </View>
          <Link href="/create-post" asChild>
            <Pressable style={styles.promptButton}>
              <Text style={styles.promptButtonText}>Create</Text>
            </Pressable>
          </Link>
        </View>

        {posts.length ? (
          <View style={styles.postList}>
            {posts.map((post) => (
              <View key={post.id} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <IdentityBadge identity={post.author} size="md" />
                  <View style={styles.postMeta}>
                    <Text style={styles.visibilityPill}>{visibilityLabels[post.visibility]}</Text>
                    <Text style={styles.postTime}>{formatPostTime(post.createdAt)}</Text>
                  </View>
                </View>

                {post.body ? <Text style={styles.postBody}>{post.body}</Text> : null}

                {post.media.length ? (
                  <View style={[styles.feedMediaGrid, post.media.length === 1 && styles.feedMediaGridSingle]}>
                    {post.media.map((item) => (
                      <View key={item.id} style={styles.feedMediaCard}>
                        {item.type === 'image' ? (
                          <Image source={{ uri: item.uri }} style={styles.feedImage} resizeMode="cover" />
                        ) : (
                          <WebFeedVideo uri={item.uri} />
                        )}
                      </View>
                    ))}
                  </View>
                ) : null}

                <View style={styles.postActions}>
                  <Text style={styles.actionText}>Like</Text>
                  <Text style={styles.actionText}>Comment</Text>
                  <Text style={styles.actionText}>Share</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
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
        )}
      </View>

      <View style={styles.rightRail}>
        <Text style={styles.panelTitle}>Today on Sori</Text>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{posts.length}</Text>
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
  postList: {
    gap: 16,
  },
  postCard: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#0f172a',
    padding: 18,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  postMeta: {
    alignItems: 'flex-end',
    gap: 5,
  },
  visibilityPill: {
    color: '#e0f2fe',
    fontSize: 11,
    fontWeight: '900',
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(103,232,249,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(103,232,249,0.26)',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  postTime: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
  },
  postBody: {
    color: '#f8fafc',
    fontSize: 18,
    lineHeight: 28,
    marginTop: 16,
  },
  feedMediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  feedMediaGridSingle: {
    flexDirection: 'column',
  },
  feedMediaCard: {
    flexGrow: 1,
    flexBasis: 260,
    minHeight: 230,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#050509',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  feedImage: {
    width: '100%',
    height: 330,
    backgroundColor: '#050509',
  },
  postActions: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 14,
    marginTop: 16,
  },
  actionText: {
    color: '#94a3b8',
    fontSize: 13,
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
