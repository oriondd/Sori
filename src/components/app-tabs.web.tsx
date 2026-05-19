import { Link, Slot, usePathname } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const navItems = [
  { href: '/', label: 'Feed', featured: false },
  { href: '/my-profile', label: 'My Profile', featured: false },
  { href: '/create-post', label: 'Create Post', featured: true },
  { href: '/market', label: 'Designer Market', featured: false },
  { href: '/dashboard', label: 'Profile Studio', featured: false },
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
          <Pressable style={({ pressed }) => [styles.brandButton, pressed && styles.pressed]}>
            <Text style={styles.brandText}>SORI</Text>
          </Pressable>
        </Link>

        <View style={styles.navGroup}>
          {navItems.map((item) => {
            const active = item.href === '/' ? pathname === '/' : pathname === item.href;
            return (
              <Link key={item.href} href={item.href} asChild>
                <Pressable
                  style={({ pressed }) => [
                    item.featured ? styles.createButton : styles.railButton,
                    active && (item.featured ? styles.createButtonActive : styles.railButtonActive),
                    pressed && styles.pressed,
                  ]}>
                  <Text style={item.featured ? styles.createButtonText : [styles.railButtonText, active && styles.railButtonTextActive]}>
                    {item.label}
                  </Text>
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
  },
  brandText: {
    color: '#ffffff',
    fontSize: 19,
    lineHeight: 26,
    fontWeight: '900',
    letterSpacing: 3,
  },
  navGroup: {
    gap: 10,
    width: '100%',
  },
  railButton: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  railButtonActive: {
    backgroundColor: 'rgba(255,60,191,0.17)',
    borderColor: '#ff3cbf',
  },
  railButtonText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '900',
  },
  railButtonTextActive: {
    color: '#ffffff',
  },
  createButton: {
    minHeight: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#ff3cbf',
    borderWidth: 1,
    borderColor: '#f0abfc',
    shadowColor: '#ff3cbf',
    shadowOpacity: 0.36,
    shadowRadius: 18,
  },
  createButtonActive: {
    borderColor: '#ffffff',
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.72,
  },
});
