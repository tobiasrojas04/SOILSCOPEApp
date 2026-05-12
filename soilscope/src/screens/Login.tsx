import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable, Image, ScrollView, useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { saveUser, getUser } from '../auth/localUser';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
// ⬇️ si ya hicimos el componente vector:
import SoilscopeLogo from '../components/SoilscopeLogo'; // si no lo tenés, usa el <Image> comentado más abajo

export default function Login() {
  const nav = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const { width } = useWindowDimensions();
  const contentW = Math.min(width - 32, 520); // ancho máximo del bloque

  useEffect(() => {
    (async () => {
      const u = await getUser();
      if (u) { setEmail(u.email); setPass(u.password); }
    })();
  }, []);

  async function handleLogin(fakeGoogle?: boolean) {
    const userEmail = fakeGoogle ? 'google.user@demo.com' : email;
    const userPass  = fakeGoogle ? 'demo1234'              : pass;

    if (!userEmail || !userPass) {
      Toast.show({ type: 'error', text1: 'Completá correo y contraseña' });
      return;
    }
    const saved = await saveUser({ email: userEmail, password: userPass, remember: true });
    console.log('LOGIN OK ->', saved);

    Toast.show({ type: 'success', text1: 'Inicio de sesión exitoso' });
    // si tu stack principal se llama "Main" (Tabs), usar replace:
    // nav.replace('Main', { initialTab: 'Home' });
    nav.replace('App'); // ajustá al nombre real de tu screen con Tabs
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0b4d22' }}>
      <LinearGradient
        colors={['#0b4d22', '#0a3d1c']} // un toque más oscuro abajo como en el PDF
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={[styles.wrap, { width: contentW }]}>
            {/* LOGO */}
            {/* Si NO tenés el componente vector, descomenta el Image y comenta el SoilscopeLogo */}
            <SoilscopeLogo width={Math.min(contentW, 360)} />
            {/* <Image source={require('../../assets/soilscope-logo.png')}
                   style={{ width: Math.min(contentW, 360), height: 80, resizeMode: 'contain' }} /> */}
            <Text style={styles.tagline}>Monitoreo inteligente para plantas indoor.</Text>

            {/* PANEL */}
            <View style={styles.card}>
              <Text style={styles.title}>Iniciar Sesión</Text>

              {/* Botón "G" simulado */}
              <Pressable style={styles.googleBtn} onPress={() => handleLogin(true)}>
                <Image source={require('../../assets/google.png')} style={styles.gIcon}/>
              </Pressable>

              <Text style={styles.alt}>
                o ingresa a la página de nuestra empresa para registrarte
              </Text>

              <TextInput
                placeholder="Iniciar Sesión..."
                placeholderTextColor="#d0dfc8"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                placeholder="Ingresar Contraseña..."
                placeholderTextColor="#d0dfc8"
                secureTextEntry
                value={pass}
                onChangeText={setPass}
                style={styles.input}
              />

              <Pressable style={styles.submit} onPress={() => handleLogin()}>
                <Text style={styles.submitTxt}>Ingresar</Text>
              </Pressable>

              <Text style={styles.forgot}>
                ¿Olvidaste tu contraseña? <Text style={styles.link}>Presiona aquí</Text>
              </Text>
            </View>

            <Text style={styles.footer}>Developed by AGCCURATE</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    // empuja el contenido hacia el centro sin quedar pegado arriba
    justifyContent: 'center',
    minHeight: '100%',
  },
  wrap: {
    alignSelf: 'center',
    alignItems: 'center',
    gap: 10,
  },
  tagline: { color: '#b9e3b4', marginBottom: 10, textAlign: 'center' },

  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: '#d5ff8a',
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 20,
    marginTop: 8,
  },
  title: { fontSize: 32, fontWeight: '900', color: '#e6ffd8', marginBottom: 12 },

  googleBtn: {
    alignSelf: 'center',
    width: 56, height: 56, borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.18)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  gIcon: { width: 28, height: 28, resizeMode: 'contain' },

  alt: { color: '#d0dfc8', textAlign: 'center', marginBottom: 12 },
  input: {
    borderBottomColor: '#d5ff8a',
    borderBottomWidth: 2,
    paddingVertical: 10,
    color: '#e9ffe3',
    marginBottom: 16,
    fontSize: 16,
  },
  submit: {
    backgroundColor: '#2c6e49',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  submitTxt: { color: '#e6ffd8', fontWeight: '800', letterSpacing: 0.3 },
  forgot: { color: '#d0dfc8', textAlign: 'center', marginTop: 12 },
  link: { textDecorationLine: 'underline', color: '#eaff9b' },
  footer: { color: '#b9e3b4', marginTop: 20, opacity: 0.9, textAlign: 'center' },
});
