import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

export default function CreatePostScreen() {
  const [postText, setPostText] = useState('');
  const { width } = useWindowDimensions();
  const compact = width < 900;

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
          Start with text now. Photo and video upload slots are staged for the next media pass.
        </Text>

        <TextInput
          style={styles.textArea}
          placeholder="Write a post..."
          placeholderTextColor="#64748b"
          multiline
          value={postText}
          onChangeText={setPostText}
        />

        <View style={styles.mediaRow}>
          <View style={styles.mediaBox}>
            <Text style={styles.mediaText}>Photo</Text>
          </View>
          <View style={styles.mediaBox}>
            <Text style={styles.mediaText}>Video</Text>
          </View>
        </View>

        <Pressable style={styles.postButton}>
          <Text style={styles.postButtonText}>Post to Sori</Text>
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
    paddingLeft: 18,
    paddingRight: 18,
    paddingTop: 92,
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
  textArea: {
    minHeight: 180,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#263244',
    backgroundColor: '#111827',
    color: '#ffffff',
    padding: 16,
    fontSize: 16,
    marginTop: 22,
    textAlignVertical: 'top',
  },
  mediaRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  mediaBox: {
    flex: 1,
    height: 96,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '900',
  },
  postButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#ff3cbf',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  postButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
});
