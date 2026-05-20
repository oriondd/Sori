import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { CurrentIdentityBadge, IdentityBadge } from '@/components/identity-badge';
import {
  deletePost,
  POSTS_CHANGED_EVENT,
  readPosts,
  resolvePostMedia,
  type PostVisibility,
  type SoriPost,
  updatePost,
  visibilityLabels,
} from '@/lib/posts';

const visibilityOptions: PostVisibility[] = ['public', 'friends', 'private'];

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
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');
  const [editVisibility, setEditVisibility] = useState<PostVisibility>('public');

  useEffect(() => {
    let mounted = true;

    async function refreshPosts() {
      const postsWithMedia = await resolvePostMedia(readPosts());
      if (mounted) {
        setPosts(postsWithMedia);
      }
    }

    refreshPosts();

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener(POSTS_CHANGED_EVENT, refreshPosts);
      window.addEventListener('storage', refreshPosts);
      return () => {
        mounted = false;
        window.removeEventListener(POSTS_CHANGED_EVENT, refreshPosts);
        window.removeEventListener('storage', refreshPosts);
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  function beginEditing(post: SoriPost) {
    setEditingPostId(post.id);
    setEditBody(post.body);
    setEditVisibility(post.visibility);
    setOpenMenuPostId(null);
  }

  function cancelEditing() {
    setEditingPostId(null);
    setEditBody('');
    setEditVisibility('public');
  }

  function savePostEdits(postId: string) {
    updatePost(postId, {
      body: editBody.trim(),
      visibility: editVisibility,
    });
    cancelEditing();
  }

  function removePost(postId: string) {
    deletePost(postId);
    if (editingPostId === postId) {
      cancelEditing();
    }
    setOpenMenuPostId(null);
  }

  function changePostVisibility(postId: string, visibility: PostVisibility) {
    updatePost(postId, { visibility });
    setOpenMenuPostId(null);
  }

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
              <View key={post.id} style={[styles.postCard, openMenuPostId === post.id && styles.postCardMenuOpen]}>
                <View style={styles.postHeader}>
                  <IdentityBadge identity={post.author} size="md" />
                  <View style={styles.postControls}>
                    <View style={styles.postMeta}>
                      <Text style={styles.visibilityPill}>{visibilityLabels[post.visibility]}</Text>
                      <Text style={styles.postTime}>{formatPostTime(post.createdAt)}</Text>
                    </View>
                    <Pressable
                      accessibilityLabel="Post options"
                      style={({ pressed }) => [styles.optionsButton, pressed && styles.pressed]}
                      onPress={() => setOpenMenuPostId((current) => (current === post.id ? null : post.id))}>
                      <Text style={styles.optionsText}>...</Text>
                    </Pressable>
                    {openMenuPostId === post.id ? (
                      <View style={styles.optionsMenu}>
                        <Pressable style={styles.menuItem} onPress={() => beginEditing(post)}>
                          <Text style={styles.menuItemText}>Edit post</Text>
                        </Pressable>
                        <Text style={styles.menuLabel}>Change visibility</Text>
                        {visibilityOptions.map((option) => (
                          <Pressable
                            key={option}
                            style={[styles.menuItem, post.visibility === option && styles.menuItemActive]}
                            onPress={() => changePostVisibility(post.id, option)}>
                            <Text style={[styles.menuItemText, post.visibility === option && styles.menuItemTextActive]}>
                              {visibilityLabels[option]}
                            </Text>
                          </Pressable>
                        ))}
                        <Pressable style={[styles.menuItem, styles.deleteMenuItem]} onPress={() => removePost(post.id)}>
                          <Text style={styles.deleteMenuText}>Delete post</Text>
                        </Pressable>
                      </View>
                    ) : null}
                  </View>
                </View>

                {editingPostId === post.id ? (
                  <View style={styles.editPanel}>
                    <TextInput
                      style={styles.editInput}
                      placeholder="Edit your post..."
                      placeholderTextColor="#64748b"
                      multiline
                      value={editBody}
                      onChangeText={setEditBody}
                    />
                    <View style={styles.editVisibilityRow}>
                      {visibilityOptions.map((option) => (
                        <Pressable
                          key={option}
                          style={[
                            styles.editVisibilityButton,
                            editVisibility === option && styles.editVisibilityButtonActive,
                          ]}
                          onPress={() => setEditVisibility(option)}>
                          <Text
                            style={[
                              styles.editVisibilityText,
                              editVisibility === option && styles.editVisibilityTextActive,
                            ]}>
                            {visibilityLabels[option]}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                    <View style={styles.editActions}>
                      <Pressable style={styles.cancelButton} onPress={cancelEditing}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </Pressable>
                      <Pressable style={styles.saveButton} onPress={() => savePostEdits(post.id)}>
                        <Text style={styles.saveButtonText}>Save changes</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : post.body ? (
                  <Text style={styles.postBody}>{post.body}</Text>
                ) : null}

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
    zIndex: 1,
  },
  postCardMenuOpen: {
    zIndex: 50,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    zIndex: 5,
  },
  postControls: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  optionsButton: {
    width: 36,
    height: 36,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsText: {
    color: '#ffffff',
    fontSize: 18,
    lineHeight: 18,
    fontWeight: '900',
    marginTop: -7,
  },
  optionsMenu: {
    position: 'absolute',
    top: 42,
    right: 0,
    width: 210,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: '#070b16',
    padding: 8,
    gap: 5,
    zIndex: 100,
    elevation: 20,
    shadowColor: '#ff3cbf',
    shadowOpacity: 0.24,
    shadowRadius: 24,
  },
  menuItem: {
    minHeight: 38,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 11,
  },
  menuItemActive: {
    backgroundColor: 'rgba(103,232,249,0.14)',
  },
  menuItemText: {
    color: '#dbeafe',
    fontSize: 12,
    fontWeight: '900',
  },
  menuItemTextActive: {
    color: '#ffffff',
  },
  menuLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: 11,
    paddingTop: 6,
  },
  deleteMenuItem: {
    backgroundColor: 'rgba(248,113,113,0.1)',
  },
  deleteMenuText: {
    color: '#fca5a5',
    fontSize: 12,
    fontWeight: '900',
  },
  postBody: {
    color: '#f8fafc',
    fontSize: 18,
    lineHeight: 28,
    marginTop: 16,
  },
  editPanel: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(103,232,249,0.18)',
    backgroundColor: 'rgba(5,5,9,0.35)',
    padding: 12,
    marginTop: 16,
    gap: 12,
  },
  editInput: {
    minHeight: 120,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#263244',
    backgroundColor: '#111827',
    color: '#ffffff',
    padding: 14,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  editVisibilityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  editVisibilityButton: {
    minHeight: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.055)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 13,
  },
  editVisibilityButtonActive: {
    borderColor: '#67e8f9',
    backgroundColor: 'rgba(103,232,249,0.18)',
  },
  editVisibilityText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '900',
  },
  editVisibilityTextActive: {
    color: '#ffffff',
  },
  editActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  cancelButton: {
    minHeight: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '900',
  },
  saveButton: {
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: '#ff3cbf',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
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
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.97 }],
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
