import { Platform } from 'react-native';

const CLAIMED_HANDLES_KEY = 'sori.identity.claimedHandles';
const RESERVED_FOUNDER_HANDLE = 'sori';

export type SoriIdentity = {
  displayName: string;
  handle: string;
  isFounder: boolean;
  verifiedBadge: 'founder-gold' | null;
};

export function normalizeHandle(value: string) {
  return value
    .trim()
    .replace(/^@+/, '')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 24);
}

export function formatHandle(value?: string | null) {
  const clean = normalizeHandle(value || '');
  return clean ? `@${clean}` : '@your-sori';
}

export function getIdentityFromMetadata(metadata?: Record<string, string | boolean | undefined>): SoriIdentity {
  const handle = typeof metadata?.handle === 'string' ? metadata.handle : '';
  const displayName = typeof metadata?.display_name === 'string' ? metadata.display_name : handle || 'Sori Creator';
  const isFounder = handle.toLowerCase() === RESERVED_FOUNDER_HANDLE || metadata?.verified_badge === 'founder-gold';

  return {
    displayName,
    handle,
    isFounder,
    verifiedBadge: isFounder ? 'founder-gold' : null,
  };
}

export function isHandleClaimedLocally(handle: string, userId: string) {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return false;
  }

  try {
    const claimed = JSON.parse(window.localStorage.getItem(CLAIMED_HANDLES_KEY) || '{}') as Record<string, string>;
    return Boolean(claimed[handle] && claimed[handle] !== userId);
  } catch {
    return false;
  }
}

export function rememberHandleLocally(handle: string, userId: string) {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return;
  }

  try {
    const claimed = JSON.parse(window.localStorage.getItem(CLAIMED_HANDLES_KEY) || '{}') as Record<string, string>;
    claimed[handle] = userId;
    window.localStorage.setItem(CLAIMED_HANDLES_KEY, JSON.stringify(claimed));
  } catch {
    // Local handle memory is just a prototype assist. Supabase should enforce this in production.
  }
}

export function getVerificationForHandle(handle: string) {
  return normalizeHandle(handle) === RESERVED_FOUNDER_HANDLE
    ? {
        isFounder: true,
        verifiedBadge: 'founder-gold' as const,
      }
    : {
        isFounder: false,
        verifiedBadge: null,
      };
}
