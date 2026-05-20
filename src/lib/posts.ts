import { Platform } from 'react-native';

import type { SoriIdentity } from '@/lib/identity';

export type PostVisibility = 'public' | 'friends' | 'private';
export type PostMediaType = 'image' | 'video';

export type SoriPostMedia = {
  id: string;
  type: PostMediaType;
  name: string;
  uri: string;
};

export type SoriPost = {
  id: string;
  body: string;
  visibility: PostVisibility;
  media: SoriPostMedia[];
  author: SoriIdentity;
  createdAt: string;
};

export const POSTS_STORAGE_KEY = 'sori.feed.posts.v1';
export const POSTS_CHANGED_EVENT = 'sori-posts-changed';

export const visibilityLabels: Record<PostVisibility, string> = {
  public: 'Public',
  friends: 'Friends only',
  private: 'Private',
};

export function canUseLocalPosts() {
  return Platform.OS === 'web' && typeof window !== 'undefined';
}

export function readPosts() {
  if (!canUseLocalPosts()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(POSTS_STORAGE_KEY);
    const posts = raw ? (JSON.parse(raw) as SoriPost[]) : [];
    return Array.isArray(posts) ? posts : [];
  } catch {
    return [];
  }
}

export function savePost(post: SoriPost) {
  if (!canUseLocalPosts()) {
    return;
  }

  const nextPosts = [post, ...readPosts()].slice(0, 100);
  window.localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(nextPosts));
  window.dispatchEvent(new CustomEvent(POSTS_CHANGED_EVENT));
}

export function makePostId() {
  const random = Math.random().toString(36).slice(2, 9);
  return `post_${Date.now()}_${random}`;
}

export function makeMediaId() {
  const random = Math.random().toString(36).slice(2, 9);
  return `media_${Date.now()}_${random}`;
}
