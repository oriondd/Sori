import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatHandle, getIdentityFromMetadata, type SoriIdentity } from '@/lib/identity';
import { getSupabase } from '@/lib/supabase';

type IdentityBadgeProps = {
  identity: SoriIdentity | null;
  size?: 'sm' | 'md' | 'lg';
  showAvatar?: boolean;
};

export function FounderVerifiedBadge({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <View style={[styles.goldBadge, size === 'sm' && styles.goldBadgeSmall]}>
      <Text style={[styles.goldBadgeText, size === 'sm' && styles.goldBadgeTextSmall]}>✓</Text>
    </View>
  );
}

export function IdentityBadge({ identity, showAvatar = true, size = 'md' }: IdentityBadgeProps) {
  const displayName = identity?.displayName || 'Sori Creator';
  const handle = formatHandle(identity?.handle);
  const initial = (displayName.trim()[0] || 'S').toUpperCase();
  const compact = size === 'sm';
  const large = size === 'lg';

  return (
    <View style={styles.row}>
      {showAvatar ? (
        <View style={[styles.avatar, compact && styles.avatarSmall, large && styles.avatarLarge]}>
          <Text style={[styles.avatarText, compact && styles.avatarTextSmall, large && styles.avatarTextLarge]}>
            {initial}
          </Text>
        </View>
      ) : null}
      <View style={styles.copy}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, compact && styles.nameSmall, large && styles.nameLarge]} numberOfLines={1}>
            {displayName}
          </Text>
          {identity?.verifiedBadge === 'founder-gold' ? <FounderVerifiedBadge size={compact ? 'sm' : 'md'} /> : null}
        </View>
        <Text style={[styles.handle, compact && styles.handleSmall]} numberOfLines={1}>
          {handle}
        </Text>
      </View>
    </View>
  );
}

export function CurrentIdentityBadge(props: Omit<IdentityBadgeProps, 'identity'>) {
  const [identity, setIdentity] = useState<SoriIdentity | null>(null);

  useEffect(() => {
    async function loadIdentity() {
      const { data } = await getSupabase().auth.getUser();
      const user = data?.user;

      if (user) {
        setIdentity(getIdentityFromMetadata(user.user_metadata));
      }
    }

    loadIdentity();
  }, []);

  return <IdentityBadge identity={identity} {...props} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#ff3cbf',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmall: {
    width: 34,
    height: 34,
    borderRadius: 11,
  },
  avatarLarge: {
    width: 118,
    height: 118,
    borderRadius: 28,
    borderWidth: 3,
  },
  avatarText: {
    color: '#050509',
    fontSize: 20,
    fontWeight: '900',
  },
  avatarTextSmall: {
    fontSize: 15,
  },
  avatarTextLarge: {
    fontSize: 62,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    minWidth: 0,
  },
  name: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    flexShrink: 1,
  },
  nameSmall: {
    fontSize: 12,
  },
  nameLarge: {
    fontSize: 44,
    lineHeight: 48,
  },
  handle: {
    color: '#facc15',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
  },
  handleSmall: {
    fontSize: 10,
  },
  goldBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#facc15',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff7ad',
    shadowColor: '#facc15',
    shadowOpacity: 0.45,
    shadowRadius: 10,
  },
  goldBadgeSmall: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  goldBadgeText: {
    color: '#451a03',
    fontSize: 13,
    fontWeight: '900',
  },
  goldBadgeTextSmall: {
    fontSize: 10,
  },
});
