import { Link, Slot, usePathname } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const navItems = [
  { href: '/', label: 'Feed', icon: 'F', accent: '#67e8f9', bg: 'rgba(103,232,249,0.1)', activeBg: 'rgba(103,232,249,0.22)', featured: false },
  { href: '/my-profile', label: 'My Profile', icon: 'P', accent: '#ff3cbf', bg: 'rgba(255,60,191,0.1)', activeBg: 'rgba(255,60,191,0.22)', featured: false },
  { href: '/create-post', label: 'Create Post', icon: '+', accent: '#facc15', bg: 'rgba(250,204,21,0.13)', activeBg: 'rgba(250,204,21,0.26)', featured: true },
  { href: '/market', label: 'Designer Market', icon: 'M', accent: '#a78bfa', bg: 'rgba(167,139,250,0.11)', activeBg: 'rgba(167,139,250,0.24)', featured: false },
  { href: '/dashboard', label: 'Profile Studio', icon: 'S', accent: '#34d399', bg: 'rgba(52,211,153,0.1)', activeBg: 'rgba(52,211,153,0.22)', featured: false },
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
                      {
                        borderColor: active ? item.accent : `${item.accent}40`,
                        backgroundColor: active ? item.activeBg : item.bg,
                        shadowColor: item.accent,
                      },
                      active && styles.railButtonActive,
                      pressed && styles.pressedButton,
                    ])
                  }>
                  <View style={styles.navButtonContent}>
                    <View style={[styles.iconBadge, { backgroundColor: item.accent }]}>
                      <Text style={styles.iconText}>{item.icon}</Text>
                    </View>
                    <Text style={[styles.railButtonText, active && styles.railButtonTextActive]}>
                      {item.label}
                    </Text>
                  </View>
                  {active ? <View style={[styles.activeGlow, { backgroundColor: item.accent }]} /> : null}
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
    width: 148,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(9,9,18,0.96)',
    padding: 12,
    justifyContent: 'flex-start',
    gap: 14,
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
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 7,
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  railButtonActive: {
    shadowOpacity: 0.28,
    shadowRadius: 18,
  },
  navButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBadge: {
    width: 27,
    height: 27,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#050509',
    fontSize: 13,
    fontWeight: '900',
  },
  railButtonText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 14,
    width: 72,
  },
  railButtonTextActive: {
    color: '#ffffff',
  },
  createButton: {
    minHeight: 56,
  },
  activeGlow: {
    position: 'absolute',
    right: 0,
    top: 10,
    bottom: 10,
    width: 3,
    borderTopLeftRadius: 999,
    borderBottomLeftRadius: 999,
  },
  pressedButton: {
    opacity: 0.82,
    transform: [{ scale: 0.96 }, { translateY: 1 }],
  },
});
