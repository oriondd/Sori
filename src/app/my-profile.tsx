import { Link } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { formatHandle, getIdentityFromMetadata, type SoriIdentity } from '@/lib/identity';
import { getSupabase } from '@/lib/supabase';

type SavedProfile = {
  themeName: string;
  html: string;
  css: string;
  js?: string;
  mode?: 'simple' | 'advanced';
};

const STORAGE_KEY = 'sori.profile.customization';
const SAFE_MODE_KEY = 'sori.profile.safeMode';
const FRAME_CSP = [
  "default-src 'none'",
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline' https://fonts.googleapis.com",
  "img-src https://images.unsplash.com https://i.scdn.co https://*.supabase.co data: blob:",
  "media-src https://*.supabase.co https://p.scdn.co https://i.scdn.co data: blob:",
  "font-src https://fonts.gstatic.com data:",
  "connect-src 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "worker-src 'none'",
].join('; ');

const topFriends = ['Bestie', 'Day 1', 'Music', 'Photo', 'Style', 'Top', 'Art', 'Mutual', 'New', 'Wild'];

const fallbackProfile: SavedProfile = {
  themeName: 'Neon Orbit',
  html: '',
  css: '',
  js: '',
  mode: 'advanced',
};

const baseFrameStyle = `
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    background: #090914;
    color: white;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    overflow: hidden;
  }
  a { color: inherit; }
`;

const responsiveFrameStyle = `
  @media (max-width: 520px) {
    body { overflow: auto; }
    h1 { font-size: 34px !important; line-height: 1 !important; }
    .sori-page, .sori-ai { padding: 20px !important; }
    .hero, .profileHeader { flex-direction: column !important; align-items: flex-start !important; }
    .avatar { width: 82px !important; height: 82px !important; font-size: 42px !important; border-radius: 22px !important; }
    .tiles, .stack, .memory-grid, .columns { grid-template-columns: 1fr !important; }
    .tiles div, article { min-height: 86px !important; }
  }
`;

function readSavedProfile(): SavedProfile {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return fallbackProfile;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...fallbackProfile, ...JSON.parse(raw) } : fallbackProfile;
  } catch {
    return fallbackProfile;
  }
}

function stripUserCsp(value: string) {
  return value.replace(/<meta[^>]+http-equiv=["']content-security-policy["'][^>]*>/gi, '');
}

function buildProfileDocument(profile: SavedProfile) {
  const html = stripUserCsp(profile.html);
  const css = profile.css;
  const js = profile.js ?? '';
  const cspMeta = `<meta http-equiv="Content-Security-Policy" content="${FRAME_CSP}" />`;
  const styleTag = `<style>${baseFrameStyle}\n${css}\n${responsiveFrameStyle}</style>`;
  const scriptTag = `<script>\n${js}\n</script>`;

  if (/<html[\s>]/i.test(html)) {
    let document = html;
    if (/<head[\s>]/i.test(document)) {
      document = document.replace(/<head([^>]*)>/i, `<head$1>\n${cspMeta}\n${styleTag}`);
    } else {
      document = document.replace(/<html([^>]*)>/i, `<html$1>\n<head>${cspMeta}\n${styleTag}</head>`);
    }

    return /<\/body>/i.test(document)
      ? document.replace(/<\/body>/i, `${scriptTag}\n</body>`)
      : `${document}\n${scriptTag}`;
  }

  return `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  ${cspMeta}
  ${styleTag}
</head>
<body>
${html}
${scriptTag}
</body>
</html>`;
}

function CustomProfileFrame({
  compact,
  onSafeMode,
  profile,
  safeMode,
}: {
  compact: boolean;
  onSafeMode: () => void;
  profile: SavedProfile;
  safeMode: boolean;
}) {
  if (Platform.OS !== 'web') {
    return (
      <View style={styles.nativeCustomFallback}>
        <Text style={styles.nativeCustomTitle}>Custom profile saved</Text>
        <Text style={styles.nativeCustomText}>Your HTML/CSS canvas is ready for the web profile preview.</Text>
      </View>
    );
  }

  if (safeMode) {
    return (
      <View style={styles.safeModePanel}>
        <Text style={styles.safeModeTitle}>Advanced profile paused</Text>
        <Text style={styles.safeModeText}>
          Safe mode is on, so the custom HTML/CSS/JS iframe is not mounted. You can re-enable it
          after editing the profile code.
        </Text>
      </View>
    );
  }

  return React.createElement('iframe' as any, {
    title: 'Sori custom profile preview',
    srcDoc: buildProfileDocument(profile),
    sandbox: 'allow-scripts',
    csp: FRAME_CSP,
    onError: onSafeMode,
    style: {
      width: compact ? '150%' : '100%',
      height: compact ? '150%' : '100%',
      border: '0',
      borderRadius: 28,
      backgroundColor: '#090914',
      transform: compact ? 'scale(0.6667)' : 'none',
      transformOrigin: 'top left',
    },
  });
}

function GoldFounderBadge() {
  return (
    <View style={styles.goldFounderBadge}>
      <Text style={styles.goldFounderBadgeText}>✓</Text>
    </View>
  );
}

function DefaultProfile({ compact, identity }: { compact: boolean; identity: SoriIdentity | null }) {
  const displayName = identity?.displayName || 'Your story starts here';
  const handle = formatHandle(identity?.handle);

  return (
    <View style={[styles.defaultCanvas, compact && styles.defaultCanvasCompact]}>
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />
      <View style={[styles.profileHeader, compact && styles.profileHeaderCompact]}>
        <View style={[styles.avatar, compact && styles.avatarCompact]}>
          <Text style={styles.avatarText}>S</Text>
        </View>
        <View style={styles.identityBlock}>
          <Text style={styles.handle}>{handle}</Text>
          <View style={styles.profileNameRow}>
            <Text style={[styles.profileTitle, compact && styles.profileTitleCompact]}>
              {compact ? displayName : displayName}
            </Text>
            {identity?.verifiedBadge === 'founder-gold' ? <GoldFounderBadge /> : null}
          </View>
          <Text style={styles.identityHandle}>{handle}</Text>
          <Text style={[styles.mood, compact && styles.moodCompact]}>
            {compact ? 'Mood: building my Sori page.' : 'Mood: building a corner of the internet that feels like me.'}
          </Text>
        </View>
      </View>

      <View style={styles.profilePanels}>
        <View style={styles.aboutPanel}>
          <Text style={styles.panelEyebrow}>ABOUT ME</Text>
          <Text style={styles.panelTitle}>Classic profile energy, modern canvas.</Text>
          <Text style={styles.panelCopy}>
            Add your intro, favorite links, photos, music taste, and whatever little details make
            the page feel personal.
          </Text>
        </View>

        <View style={styles.statusPanel}>
          <Text style={styles.panelEyebrow}>CURRENTLY</Text>
          <Text style={styles.statusText}>Designing my first Sori profile.</Text>
        </View>
      </View>

      <View style={styles.photoStrip}>
        <View style={styles.photoTile}>
          <Text style={styles.photoText}>photo</Text>
        </View>
        <View style={styles.photoTileAlt}>
          <Text style={styles.photoText}>post</Text>
        </View>
        <View style={styles.photoTile}>
          <Text style={styles.photoText}>music</Text>
        </View>
      </View>
    </View>
  );
}

export default function MyProfileScreen() {
  const { width } = useWindowDimensions();
  const [profile, setProfile] = useState<SavedProfile>(fallbackProfile);
  const [identity, setIdentity] = useState<SoriIdentity | null>(null);
  const [safeMode, setSafeMode] = useState(false);
  const compact = width < 760;

  useEffect(() => {
    setProfile(readSavedProfile());
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      setSafeMode(window.localStorage.getItem(SAFE_MODE_KEY) === 'true');
    }

    async function loadIdentity() {
      const { data } = await getSupabase().auth.getUser();
      const user = data?.user;
      if (user) {
        setIdentity(getIdentityFromMetadata(user.user_metadata));
      }
    }

    loadIdentity();
  }, []);

  const hasCustomCode = useMemo(
    () => profile.html.trim().length > 0 || profile.css.trim().length > 0 || (profile.js ?? '').trim().length > 0,
    [profile],
  );
  const setProfileSafeMode = (enabled: boolean) => {
    setSafeMode(enabled);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.setItem(SAFE_MODE_KEY, enabled ? 'true' : 'false');
    }
  };

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={StyleSheet.flatten([styles.content, compact && styles.contentCompact])}>
      <View style={[styles.topBar, compact && styles.topBarCompact]}>
        <View>
          <Text style={styles.pageLabel}>MY PROFILE</Text>
          <Text style={[styles.pageTitle, compact && styles.pageTitleCompact]}>
            {compact ? 'Profile' : 'Your Sori page'}
          </Text>
        </View>
        <Link href="/customize-profile" asChild>
          <Pressable style={StyleSheet.flatten([styles.customizeButton, compact && styles.customizeButtonCompact])}>
            <Text style={styles.customizeButtonText}>Customize</Text>
          </Pressable>
        </Link>
      </View>

      <View style={[styles.profileLayout, compact && styles.profileLayoutCompact]}>
        <View style={[styles.mainProfile, compact && styles.mainProfileCompact]}>
          {hasCustomCode ? (
            <CustomProfileFrame
              compact={compact}
              onSafeMode={() => setProfileSafeMode(true)}
              profile={profile}
              safeMode={safeMode}
            />
          ) : (
            <DefaultProfile compact={compact} identity={identity} />
          )}
        </View>

        <View style={[styles.sideColumn, compact && styles.sideColumnCompact]}>
          <View style={styles.miniCard}>
            <Text style={styles.miniLabel}>THEME</Text>
            <Text style={styles.miniTitle}>{profile.themeName}</Text>
            <View style={styles.miniIdentityRow}>
              <Text style={styles.miniCopy}>{formatHandle(identity?.handle)}</Text>
              {identity?.verifiedBadge === 'founder-gold' ? <GoldFounderBadge /> : null}
            </View>
            {hasCustomCode ? (
              <Pressable
                style={styles.safeToggle}
                onPress={() => setProfileSafeMode(!safeMode)}>
                <Text style={styles.safeToggleText}>
                  {safeMode ? 'Render Advanced Profile' : 'Safe Mode'}
                </Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.topTenCard}>
            <Text style={styles.topTenTitle}>My Top 10</Text>
            <View style={styles.topTenGrid}>
              {topFriends.map((friend, index) => (
                <View key={friend} style={[styles.friendSlot, compact && styles.friendSlotCompact]}>
                  <Text style={[styles.friendNumber, compact && styles.friendNumberCompact]}>{index + 1}</Text>
                  <Text style={[styles.friendName, compact && styles.friendNameCompact]}>{friend}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#050509' },
  content: {
    minHeight: '100%',
    paddingLeft: 184,
    paddingRight: 24,
    paddingTop: 24,
    paddingBottom: 36,
    gap: 18,
  },
  contentCompact: {
    paddingLeft: 172,
    paddingRight: 10,
    paddingTop: 22,
    gap: 12,
  },
  topBar: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  topBarCompact: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  pageLabel: {
    color: '#ff3cbf',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.8,
  },
  pageTitle: {
    color: '#ffffff',
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '900',
    marginTop: 2,
  },
  pageTitleCompact: {
    fontSize: 22,
    lineHeight: 27,
  },
  customizeButton: {
    minWidth: 116,
    height: 44,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  customizeButtonCompact: {
    minWidth: 0,
    width: '100%',
    height: 40,
  },
  customizeButtonText: {
    color: '#050509',
    fontSize: 14,
    fontWeight: '900',
  },
  profileLayout: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 18,
  },
  profileLayoutCompact: {
    flexDirection: 'column',
    gap: 12,
  },
  mainProfile: {
    flex: 1,
    minWidth: 360,
    height: 680,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#080812',
    overflow: 'hidden',
  },
  mainProfileCompact: {
    minWidth: 0,
    width: '100%',
    height: 560,
    borderRadius: 24,
  },
  sideColumn: {
    width: 230,
    gap: 14,
  },
  sideColumnCompact: {
    width: '100%',
    gap: 10,
  },
  defaultCanvas: {
    flex: 1,
    padding: 28,
    backgroundColor: '#10101d',
    overflow: 'hidden',
  },
  defaultCanvasCompact: {
    padding: 16,
  },
  glowOne: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#ff3cbf',
    opacity: 0.22,
    right: -120,
    top: -100,
  },
  glowTwo: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#67e8f9',
    opacity: 0.16,
    left: -90,
    bottom: -70,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  profileHeaderCompact: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 10,
  },
  avatar: {
    width: 118,
    height: 118,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#ff3cbf',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCompact: {
    width: 76,
    height: 76,
    borderRadius: 20,
  },
  avatarText: {
    color: '#050509',
    fontSize: 62,
    fontWeight: '900',
  },
  identityBlock: {
    flex: 1,
    minWidth: 0,
  },
  handle: {
    color: '#67e8f9',
    fontSize: 14,
    fontWeight: '900',
  },
  profileTitle: {
    color: '#ffffff',
    fontSize: 44,
    lineHeight: 48,
    fontWeight: '900',
    marginTop: 4,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  profileTitleCompact: {
    fontSize: 29,
    lineHeight: 32,
  },
  identityHandle: {
    color: '#facc15',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 6,
  },
  mood: {
    color: '#dbeafe',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  moodCompact: {
    fontSize: 13,
    lineHeight: 19,
  },
  profilePanels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 30,
  },
  aboutPanel: {
    flex: 1.4,
    minWidth: 250,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.07)',
    padding: 20,
  },
  statusPanel: {
    flex: 1,
    minWidth: 190,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,60,191,0.34)',
    backgroundColor: 'rgba(255,60,191,0.12)',
    padding: 20,
  },
  panelEyebrow: {
    color: '#f0abfc',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  panelTitle: {
    color: '#ffffff',
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '900',
    marginTop: 8,
  },
  panelCopy: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 10,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '900',
    marginTop: 10,
  },
  photoStrip: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 28,
  },
  photoTile: {
    flex: 1,
    height: 150,
    borderRadius: 24,
    backgroundColor: 'rgba(103,232,249,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(103,232,249,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoTileAlt: {
    flex: 1,
    height: 150,
    borderRadius: 24,
    backgroundColor: 'rgba(255,60,191,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,60,191,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  miniCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#0f172a',
    padding: 18,
  },
  miniLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  miniTitle: {
    color: '#ffffff',
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '900',
    marginTop: 8,
  },
  miniCopy: {
    color: '#ff3cbf',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 6,
  },
  miniIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  goldFounderBadge: {
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: '#facc15',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff7ad',
    shadowColor: '#facc15',
    shadowOpacity: 0.45,
    shadowRadius: 10,
  },
  goldFounderBadgeText: {
    color: '#451a03',
    fontSize: 14,
    fontWeight: '900',
  },
  safeToggle: {
    height: 38,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingHorizontal: 10,
  },
  safeToggleText: {
    color: '#050509',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  safeModePanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#090914',
  },
  safeModeTitle: {
    color: '#ffffff',
    fontSize: 28,
    lineHeight: 33,
    fontWeight: '900',
    textAlign: 'center',
  },
  safeModeText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 420,
  },
  topTenCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,60,191,0.22)',
    backgroundColor: 'rgba(255,255,255,0.055)',
    padding: 14,
  },
  topTenTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
  },
  topTenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  friendSlot: {
    width: '47%',
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  friendSlotCompact: {
    width: '30%',
    minHeight: 48,
    borderRadius: 13,
    padding: 4,
  },
  friendNumber: {
    color: '#ff3cbf',
    fontSize: 13,
    fontWeight: '900',
  },
  friendNumberCompact: {
    fontSize: 11,
  },
  friendName: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 2,
    textAlign: 'center',
  },
  friendNameCompact: {
    fontSize: 8,
  },
  nativeCustomFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  nativeCustomTitle: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
  },
  nativeCustomText: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    textAlign: 'center',
  },
});
