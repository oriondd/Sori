import { Platform } from 'react-native';

import type { SoriIdentity } from '@/lib/identity';

export type PostVisibility = 'public' | 'friends' | 'private';
export type PostMediaType = 'image' | 'video';

export type SoriPostMedia = {
  id: string;
  type: PostMediaType;
  name: string;
  uri: string;
  fallbackUri?: string;
  blob?: Blob;
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

const MEDIA_DB_NAME = 'sori-feed-media';
const MEDIA_STORE_NAME = 'media';
const MEDIA_URI_PREFIX = 'indexeddb:';

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

function openMediaDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (!canUseLocalPosts() || !('indexedDB' in window)) {
      reject(new Error('IndexedDB is not available.'));
      return;
    }

    const request = window.indexedDB.open(MEDIA_DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(MEDIA_STORE_NAME)) {
        db.createObjectStore(MEDIA_STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function withMediaStore<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>) {
  return openMediaDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(MEDIA_STORE_NAME, mode);
        const store = transaction.objectStore(MEDIA_STORE_NAME);
        const request = action(store);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        transaction.oncomplete = () => db.close();
        transaction.onerror = () => {
          db.close();
          reject(transaction.error);
        };
      }),
  );
}

async function saveMediaBlob(media: SoriPostMedia) {
  if (!media.blob) {
    return media;
  }

  await withMediaStore('readwrite', (store) =>
    store.put(
      {
        blob: media.blob,
        type: media.type,
        name: media.name,
      },
      media.id,
    ),
  );

  return {
    id: media.id,
    type: media.type,
    name: media.name,
    fallbackUri: media.fallbackUri,
    uri: `${MEDIA_URI_PREFIX}${media.id}`,
  };
}

async function deleteMediaBlob(mediaId: string) {
  try {
    await withMediaStore('readwrite', (store) => store.delete(mediaId));
  } catch {
    // Media cleanup is best-effort in the local prototype.
  }
}

async function resolveMediaUri(media: SoriPostMedia) {
  if (!media.uri.startsWith(MEDIA_URI_PREFIX)) {
    return media;
  }

  try {
    const mediaRecord = await withMediaStore<{
      blob?: Blob;
      type?: PostMediaType;
      name?: string;
    }>('readonly', (store) => store.get(media.id));

    if (!mediaRecord?.blob) {
      if (media.fallbackUri) {
        return {
          ...media,
          uri: media.fallbackUri,
        };
      }

      return media;
    }

    return {
      ...media,
      uri: URL.createObjectURL(mediaRecord.blob),
      type: mediaRecord.type || media.type,
      name: mediaRecord.name || media.name,
    };
  } catch {
    return media;
  }
}

async function preparePostForStorage(post: SoriPost) {
  const media = await Promise.all(post.media.map(saveMediaBlob));

  return {
    ...post,
    media,
  };
}

export async function resolvePostMedia(posts: SoriPost[]) {
  const resolvedPosts = await Promise.all(
    posts.map(async (post) => ({
      ...post,
      media: await Promise.all(post.media.map(resolveMediaUri)),
    })),
  );

  return resolvedPosts;
}

export async function savePost(post: SoriPost) {
  if (!canUseLocalPosts()) {
    return;
  }

  const postForStorage = await preparePostForStorage(post);
  const nextPosts = [postForStorage, ...readPosts()].slice(0, 100);
  window.localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(nextPosts));
  window.dispatchEvent(new CustomEvent(POSTS_CHANGED_EVENT));
}

export function updatePost(postId: string, updates: Partial<Pick<SoriPost, 'body' | 'visibility'>>) {
  if (!canUseLocalPosts()) {
    return;
  }

  const nextPosts = readPosts().map((post) =>
    post.id === postId
      ? {
          ...post,
          ...updates,
        }
      : post,
  );

  window.localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(nextPosts));
  window.dispatchEvent(new CustomEvent(POSTS_CHANGED_EVENT));
}

export function deletePost(postId: string) {
  if (!canUseLocalPosts()) {
    return;
  }

  const posts = readPosts();
  const postToDelete = posts.find((post) => post.id === postId);
  const nextPosts = posts.filter((post) => post.id !== postId);

  postToDelete?.media.forEach((media) => {
    if (media.uri.startsWith(MEDIA_URI_PREFIX)) {
      deleteMediaBlob(media.id);
    }
  });

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
