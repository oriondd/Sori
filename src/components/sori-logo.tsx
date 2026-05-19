import React from 'react';
import { Image as NativeImage, Platform, StyleSheet, View, type ImageStyle, type ViewStyle } from 'react-native';

type SoriLogoProps = {
  compact?: boolean;
};

const logoSource = require('@/assets/images/sori-logo-cropped.png');
const webLogoUri = '/assets/?unstable_path=.%2Fassets%2Fimages/sori-logo-cropped.png';

export function SoriLogo({ compact = false }: SoriLogoProps) {
  const frameStyle: ViewStyle[] = compact ? [styles.logoFrame, styles.logoFrameCompact] : [styles.logoFrame];
  const nativeImageStyle: ImageStyle[] = compact ? [styles.logo, styles.logoCompact] : [styles.logo];
  const webImageStyle = compact ? webStyles.logoCompact : webStyles.logo;

  return (
    <View style={frameStyle}>
      {Platform.OS === 'web' ? (
        React.createElement('img', {
          src: webLogoUri,
          alt: 'Sori',
          style: webImageStyle,
        })
      ) : (
        <NativeImage
          source={logoSource}
          style={nativeImageStyle}
          resizeMode="contain"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  logoFrame: {
    width: 260,
    height: 210,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoFrameCompact: {
    width: 118,
    height: 48,
  },
  logo: {
    width: 260,
    height: 210,
  },
  logoCompact: {
    width: 118,
    height: 48,
  },
});

const webStyles = {
  logo: {
    width: 260,
    height: 210,
    objectFit: 'contain',
    display: 'block',
  },
  logoCompact: {
    width: 118,
    height: 48,
    objectFit: 'contain',
    display: 'block',
  },
} as const;
