// components/ScreenBackground.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

export default function ScreenBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* color base del tema */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]} />
      {/* velo sutil en diagonal (opcional, queda lindo con el header) */}
      <LinearGradient
        colors={['rgba(255,255,255,0.02)', 'rgba(0,0,0,0.04)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
