import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

import { IdentityBadge } from '@/components/identity-badge';
import { getIdentityFromMetadata, type SoriIdentity } from '@/lib/identity';
import { makeMediaId, makePostId, savePost, type PostMediaType, type PostVisibility, type SoriPostMedia, visibilityLabels } from '@/lib/posts';
import { getSupabase } from '@/lib/supabase';

const maxMediaItems = 4;
const visibilityOptions: PostVisibility[] = ['public', 'friends', 'private'];

function getMediaType(file: File): PostMediaType | null {
  if (file.type.startsWith('image/')) {
    return 'image';
  }

  if (file.type.startsWith('video/')) {
    return 'video';
  }

  return null;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function WebVideoPreview({ uri }: { uri: string }) {
  if (Platform.OS !== 'web') {
    return null;
  }

  return React.createElement('video', {
    src: uri,
    controls: true,
    muted: true,
    playsInline: true,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: 15,
      backgroundColor: '#050509',
    },
  });
}

function ComposerImagePreview({ uri }: { uri: string }) {
  if (Platform.OS === 'web') {
    return React.createElement('img', {
      src: uri,
      alt: '',
      style: {
        width: '100%',
        height: 120,
        display: 'block',
        objectFit: 'cover',
        borderRadius: 14,
        backgroundColor: '#050509',
      },
    });
  }

  return <Image source={{ uri }} style={styles.previewImage} resizeMode="cover" />;
}

export default function CreatePostScreen() {
  const [postText, setPostText] = useState('');
  const [visibility, setVisibility] = useState<PostVisibility>('public');
  const [visibilityMenuOpen, setVisibilityMenuOpen] = useState(false);
  const [media, setMedia] = useState<SoriPostMedia[]>([]);
  const [identity, setIdentity] = useState<SoriIdentity | null>(null);
  const [identityLoading, setIdentityLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const { width } = useWindowDimensions();
  const compact = width < 900;
  const canPost = !isPublishing && (postText.trim().length > 0 || media.length > 0);

  useEffect(() => {
    let mounted = true;

    async function loadIdentity() {
      try {
        const { data } = await getSupabase().auth.getUser();
        if (mounted) {
          setIdentity(data?.user ? getIdentityFromMetadata(data.user.user_metadata) : null);
        }
      } finally {
        if (mounted) {
          setIdentityLoading(false);
        }
      }
    }

    loadIdentity();
    return () => {
      mounted = false;
    };
  }, []);

  async function pickMedia(kind: 'image' | 'video') {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      setStatusMessage('Media picker is wired for web first. Native Expo media picker comes next.');
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = kind === 'image' ? 'image/*' : 'video/*';

    input.onchange = async () => {
      const files = Array.from(input.files || []);
      const slotsLeft = Math.max(maxMediaItems - media.length, 0);
      const usableFiles = files.slice(0, slotsLeft);

      if (!usableFiles.length) {
        setStatusMessage(`You can attach up to ${maxMediaItems} media items per post for now.`);
        return;
      }

      const nextMedia = await Promise.all(
        usableFiles.map(async (file) => {
          const type = getMediaType(file);
          if (!type) {
            return null;
          }

          return {
            id: makeMediaId(),
            type,
            name: file.name,
            uri: URL.createObjectURL(file),
            fallbackUri: type === 'image' ? await readFileAsDataUrl(file) : undefined,
            blob: file,
          };
        }),
      );

      setMedia((current) => [...current, ...nextMedia.filter(Boolean) as SoriPostMedia[]].slice(0, maxMediaItems));
      setStatusMessage('');
    };

    input.click();
  }

  function removeMedia(mediaId: string) {
    setMedia((current) => {
      const itemToRemove = current.find((item) => item.id === mediaId);
      if (itemToRemove?.uri.startsWith('blob:')) {
        URL.revokeObjectURL(itemToRemove.uri);
      }

      return current.filter((item) => item.id !== mediaId);
    });
  }

  async function publishPost() {
    if (!canPost) {
      setStatusMessage('Write something or attach a photo/video before posting.');
      return;
    }

    const author =
      identity ||
      ({
        displayName: 'Sori Creator',
        handle: '',
        isFounder: false,
        verifiedBadge: null,
      } satisfies SoriIdentity);

    setIsPublishing(true);
    setStatusMessage('Posting to Sori...');

    try {
      await savePost({
        id: makePostId(),
        body: postText.trim(),
        visibility,
        media,
        author,
        createdAt: new Date().toISOString(),
      });

      media.forEach((item) => {
        if (item.uri.startsWith('blob:')) {
          URL.revokeObjectURL(item.uri);
        }
      });

      setPostText('');
      setMedia([]);
      setVisibility('public');
      setVisibilityMenuOpen(false);
      setStatusMessage('Posted to the Sori feed.');
      router.replace('/');
    } catch {
      setStatusMessage('Something went wrong posting that media. Try a smaller file.');
      setIsPublishing(false);
    }
  }

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={StyleSheet.flatten([
        styles.content,
        compact && styles.contentCompact,
      ])}>
      <View style={styles.composer}>
        <Text style={styles.kicker}>CREATE POST</Text>
        <Text style={styles.title}>Share something new.</Text>
        <Text style={styles.subtitle}>
          Write a thought, attach photos or videos, then choose who gets to see it.
        </Text>

        <View style={styles.identityStrip}>
          <IdentityBadge identity={identity} loading={identityLoading} size="md" />
          <View style={styles.visibilityGroup}>
            <Text style={styles.visibilityLabel}>Post visibility</Text>
            <Pressable
              style={({ pressed }) => [styles.visibilityButton, pressed && styles.pressed]}
              onPress={() => setVisibilityMenuOpen((open) => !open)}>
              <Text style={styles.visibilityText}>{visibilityLabels[visibility]}</Text>
              <Text style={styles.chevron}>{visibilityMenuOpen ? '^' : 'v'}</Text>
            </Pressable>
            {visibilityMenuOpen ? (
              <View style={styles.visibilityMenu}>
                {visibilityOptions.map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => {
                      setVisibility(option);
                      setVisibilityMenuOpen(false);
                    }}
                    style={[
                      styles.visibilityOption,
                      visibility === option && styles.visibilityOptionActive,
                    ]}>
                    <Text style={[styles.visibilityOptionText, visibility === option && styles.visibilityOptionTextActive]}>
                      {visibilityLabels[option]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        </View>

        <TextInput
          style={styles.textArea}
          placeholder="Write a post..."
          placeholderTextColor="#64748b"
          multiline
          value={postText}
          onChangeText={setPostText}
        />

        <View style={styles.mediaRow}>
          <Pressable style={({ pressed }) => [styles.mediaBox, pressed && styles.pressed]} onPress={() => pickMedia('image')}>
            <Text style={styles.mediaText}>Add Photo</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.mediaBox, pressed && styles.pressed]} onPress={() => pickMedia('video')}>
            <Text style={styles.mediaText}>Add Video</Text>
          </Pressable>
        </View>

        {media.length ? (
          <View style={styles.previewGrid}>
            {media.map((item) => (
              <View key={item.id} style={styles.previewCard}>
                {item.type === 'image' ? (
                  <ComposerImagePreview uri={item.uri} />
                ) : (
                  <WebVideoPreview uri={item.uri} />
                )}
                <Pressable style={styles.removeButton} onPress={() => removeMedia(item.id)}>
                  <Text style={styles.removeButtonText}>Remove</Text>
                </Pressable>
                <Text style={styles.mediaName} numberOfLines={1}>
                  {item.name}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {statusMessage ? <Text style={styles.statusMessage}>{statusMessage}</Text> : null}

        <Pressable
          style={({ pressed }) => [styles.postButton, !canPost && styles.postButtonDisabled, pressed && canPost && styles.pressed]}
          onPress={publishPost}>
          <Text style={styles.postButtonText}>{isPublishing ? 'Posting...' : 'Post to Sori'}</Text>
        </Pressable>

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
    paddingLeft: 184,
    paddingRight: 18,
    paddingTop: 34,
  },
  composer: {
    maxWidth: 720,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#0f172a',
    padding: 24,
  },
  kicker: {
    color: '#ff3cbf',
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
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 16,
    lineHeight: 25,
    marginTop: 10,
  },
  identityStrip: {
    gap: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.055)',
    padding: 14,
    marginTop: 20,
  },
  visibilityGroup: {
    gap: 8,
    maxWidth: 260,
  },
  visibilityLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  visibilityButton: {
    minHeight: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(103,232,249,0.28)',
    backgroundColor: 'rgba(103,232,249,0.12)',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 14,
  },
  visibilityText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  chevron: {
    color: '#67e8f9',
    fontSize: 10,
    fontWeight: '900',
  },
  visibilityMenu: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#0b1120',
    padding: 6,
    gap: 4,
  },
  visibilityOption: {
    minHeight: 36,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 11,
  },
  visibilityOptionActive: {
    backgroundColor: 'rgba(255,60,191,0.18)',
  },
  visibilityOptionText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '900',
  },
  visibilityOptionTextActive: {
    color: '#ffffff',
  },
  textArea: {
    minHeight: 180,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#263244',
    backgroundColor: '#111827',
    color: '#ffffff',
    padding: 16,
    fontSize: 16,
    marginTop: 14,
    textAlignVertical: 'top',
  },
  mediaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
  },
  mediaBox: {
    flex: 1,
    minWidth: 150,
    height: 96,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(103,232,249,0.24)',
    backgroundColor: 'rgba(103,232,249,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaText: {
    color: '#e0f2fe',
    fontSize: 14,
    fontWeight: '900',
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
  },
  previewCard: {
    width: 156,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.055)',
    padding: 8,
  },
  previewImage: {
    width: '100%',
    height: 120,
    borderRadius: 14,
    backgroundColor: '#050509',
  },
  removeButton: {
    position: 'absolute',
    right: 14,
    top: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(5,5,9,0.82)',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },
  mediaName: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 7,
  },
  statusMessage: {
    color: '#facc15',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 14,
  },
  postButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#ff3cbf',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  postButtonDisabled: {
    opacity: 0.45,
  },
  postButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
});
