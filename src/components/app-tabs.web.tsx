import { Link, Slot, usePathname } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const navItems = [
  { href: '/', label: 'Feed', accent: '#67e8f9', bg: 'rgba(103,232,249,0.24)', activeBg: 'rgba(103,232,249,0.42)', featured: false },
  { href: '/my-profile', label: 'My Profile', accent: '#ff3cbf', bg: 'rgba(255,60,191,0.24)', activeBg: 'rgba(255,60,191,0.42)', featured: false },
  { href: '/create-post', label: 'Create Post', accent: '#facc15', bg: 'rgba(250,204,21,0.25)', activeBg: 'rgba(250,204,21,0.46)', featured: true },
  { href: '/market', label: 'Market', accent: '#a78bfa', bg: 'rgba(167,139,250,0.24)', activeBg: 'rgba(167,139,250,0.42)', featured: false },
  { href: '/dashboard', label: 'Studio', accent: '#34d399', bg: 'rgba(52,211,153,0.24)', activeBg: 'rgba(52,211,153,0.42)', featured: false },
] as const;

export default function AppTabs() {
  const pathname = usePathname();

  return (
    <View style={styles.shell}>
      <View style={styles.content}>
        <Slot />
      </View>

      <View style={styles.sidebar}>
        <Link href="/" asChild>
          <Pressable style={({ pressed }) => [styles.brandButton, pressed && styles.pressedButton]}>
            <Text style={styles.brandText}>SORI</Text>
          </Pressable>
        </Link>

        <View style={styles.navGroup}>
          {navItems.map((item) => {
            const active = item.href === '/' ? pathname === '/' : pathname === item.href;
            return (
              <Link key={item.href} href={item.href} asChild>
                <Pressable
                  style={({ pressed }) =>
                    StyleSheet.flatten([
                      styles.railButton,
                      item.featured && styles.createButton,
                      { shadowColor: item.accent },
                      active && styles.railButtonActive,
                      pressed && styles.pressedButton,
                    ])
                  }>
                  <View
                    style={[
                      styles.navButtonContent,
                      {
                        borderColor: active ? item.accent : `${item.accent}a8`,
                        backgroundColor: active ? item.activeBg : item.bg,
                      },
                    ]}>
                    <Text style={[styles.railButtonText, active && styles.railButtonTextActive]}>
                      {item.label}
                    </Text>
                    {active ? <View style={[styles.activeGlow, { backgroundColor: item.accent }]} /> : null}
                  </View>
                </Pressable>
              </Link>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: '#050509',
  },
  content: {
    flex: 1,
    minHeight: '100%',
    backgroundColor: '#050509',
  },
  sidebar: {
    position: 'absolute',
    left: 12,
    top: 18,
    bottom: 18,
    zIndex: 30,
    width: 156,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(9,9,18,0.96)',
    padding: 11,
    justifyContent: 'flex-start',
    gap: 12,
    flexDirection: 'column',
    alignItems: 'stretch',
    shadowColor: '#ff3cbf',
    shadowOpacity: 0.16,
    shadowRadius: 28,
  },
  brandButton: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,60,191,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(255,60,191,0.36)',
    shadowColor: '#ff3cbf',
    shadowOpacity: 0.22,
    shadowRadius: 16,
  },
  brandText: {
    color: '#ffffff',
    fontSize: 19,
    lineHeight: 26,
    fontWeight: '900',
    letterSpacing: 3,
  },
  navGroup: {
    gap: 9,
    width: '100%',
  },
  railButton: {
    minHeight: 46,
    borderRadius: 18,
    justifyContent: 'center',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  railButtonActive: {
    shadowOpacity: 0.36,
    shadowRadius: 20,
    transform: [{ translateX: 2 }],
  },
  navButtonContent: {
    minHeight: 44,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: '100%',
  },
  railButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
    textAlign: 'center',
  },
  railButtonTextActive: {
    color: '#ffffff',
  },
  createButton: {
    minHeight: 54,
  },
  activeGlow: {
    position: 'absolute',
    left: 8,
    top: 9,
    bottom: 9,
    width: 3,
    borderRadius: 999,
  },
  pressedButton: {
    opacity: 0.82,
    transform: [{ scale: 0.96 }, { translateY: 1 }],
  },
});
