import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';

import { formatHandle, getIdentityFromMetadata, type SoriIdentity } from '@/lib/identity';
import { getSupabase } from '@/lib/supabase';

const founderBadgeImage = require('../../assets/images/founder-badge.png');

type IdentityBadgeProps = {
  identity: SoriIdentity | null;
  size?: 'sm' | 'md' | 'lg';
  showAvatar?: boolean;
};

export function FounderVerifiedBadge({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const sheen = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(sheen, {
          toValue: 1,
          duration: 1450,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.delay(900),
        Animated.timing(sheen, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [sheen]);

  const compact = size === 'sm';
  const translateX = sheen.interpolate({
    inputRange: [0, 1],
    outputRange: [compact ? -18 : -24, compact ? 22 : 32],
  });

  return (
    <View style={[styles.founderBadge, compact && styles.founderBadgeSmall]}>
      <Image source={founderBadgeImage} style={styles.founderBadgeImage} resizeMode="cover" />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.founderBadgeSheen,
          compact && styles.founderBadgeSheenSmall,
          { transform: [{ translateX }, { rotate: '22deg' }] },
        ]}
      />
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
  founderBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,214,232,0.9)',
    backgroundColor: '#2a111d',
    shadowColor: '#ff7ab6',
    shadowOpacity: 0.55,
    shadowRadius: 12,
  },
  founderBadgeSmall: {
    width: 19,
    height: 19,
    borderRadius: 10,
  },
  founderBadgeImage: {
    width: '100%',
    height: '100%',
  },
  founderBadgeSheen: {
    position: 'absolute',
    top: -7,
    bottom: -7,
    width: 9,
    backgroundColor: 'rgba(255,255,255,0.72)',
    opacity: 0.82,
  },
  founderBadgeSheenSmall: {
    top: -5,
    bottom: -5,
    width: 6,
  },
});
