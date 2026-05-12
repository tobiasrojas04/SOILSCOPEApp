// src/screens/Welcome.tsx
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Image, ImageBackground, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import SoilscopeLogo from '../components/SoilscopeLogo';

const MONITOREO_IMG = { uri: 'https://images.pexels.com/photos/4507738/pexels-photo-4507738.jpeg' };
const INFO_IMG       = { uri: 'https://images.pexels.com/photos/4451739/pexels-photo-4451739.jpeg' };

export default function Welcome() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const contentW = Math.min(width - 32, 480);
  const cardSize = Math.min(contentW, 420);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8, alignItems: 'center' }]}>
        {/* Logo */}
        <SoilscopeLogo width={contentW} />
        <Text style={styles.tagline}>Monitoreo inteligente para plantas indoor.</Text>

        {/* Card Monitoreo */}
        <Pressable onPress={() => nav.navigate('Live')} style={{ width: contentW, marginTop: 16 }}>
          <ImageBackground
            source={MONITOREO_IMG}
            blurRadius={8}
            onError={() => {}}
            style={{ width: '100%', height: cardSize, borderRadius: 20, overflow: 'hidden', justifyContent: 'flex-end' }}
            imageStyle={{ borderRadius: 20, opacity: 0.9 }}
          >
            {/* Scrim/fallback */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.45)']}
              style={{ ...StyleSheet.absoluteFillObject }}
            />
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>MONITOREO</Text>
              <Text style={styles.cardSub}>EN TIEMPO REAL</Text>
            </View>
          </ImageBackground>
        </Pressable>

        {/* Card Información biológica */}
        <Pressable onPress={() => nav.navigate('History')} style={{ width: contentW, marginTop: 16, marginBottom: 16 }}>
          <ImageBackground
            source={INFO_IMG}
            blurRadius={8}
            style={{ width: '100%', height: cardSize, borderRadius: 20, overflow: 'hidden', justifyContent: 'flex-end' }}
            imageStyle={{ borderRadius: 20, opacity: 0.9 }}
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.45)']}
              style={{ ...StyleSheet.absoluteFillObject }}
            />
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>INFORMACIÓN</Text>
              <Text style={styles.cardSub}>BIOLÓGICA</Text>
            </View>
          </ImageBackground>
        </Pressable>

        <Text style={styles.footer}>Developed by AGCCURATE</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0b4d22' },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },
  tagline: { color: '#b9e3b4', textAlign: 'center', marginTop: 6, marginBottom: 6, fontSize: 14 },
  cardText: { padding: 18, alignItems: 'center' },
  cardTitle: { color: '#f0fff0', fontSize: 28, fontWeight: '900', letterSpacing: 1 },
  cardSub: { color: '#f0fff0', fontSize: 14, marginTop: 4, letterSpacing: 2 },
  footer: { color: '#b9e3b4', marginTop: 8, opacity: 0.8, textAlign: 'center' },
});
