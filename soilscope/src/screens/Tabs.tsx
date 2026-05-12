// src/screens/Tabs.tsx
import React from 'react';
import {
  createBottomTabNavigator,
  BottomTabBar,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import Welcome from './Welcome';
import LiveSensors from './LiveSensors';   
import History from './History';
import Settings from './Settings';


const Tab = createBottomTabNavigator();

function CurvedTabBar(props: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomGap = Math.max(insets.bottom, 10) + 8;

  return (
    <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, { justifyContent: 'flex-end' }]}>
      {/* línea full width */}
      <View style={[styles.bottomLine, { bottom: bottomGap - 6 }]} />
      {/* contenedor curvo centrado */}
      <View style={[styles.barContainer, { marginBottom: bottomGap }]}>
        <BottomTabBar {...props} />
      </View>
    </View>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(p) => <CurvedTabBar {...p} />}
      screenOptions={{
        headerShown: false,
        // 👇 EL GRADIENTE VA AQUÍ (no en <BottomTabBar/>)
        tabBarBackground: () => (
          <LinearGradient
            style={StyleSheet.absoluteFill}
            colors={['#0aa0b5', '#36c08f', '#7ee36b']} // ajustá a gusto
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
          />
        ),
        tabBarStyle: {
          backgroundColor: 'transparent',   // el fondo lo pone tabBarBackground
          borderTopColor: 'transparent',
          height: 62,
          paddingTop: 6,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.82)',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.2, marginTop: 2 },
        tabBarItemStyle: { paddingHorizontal: 6 },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={Welcome}
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Live"
        component={LiveSensors}
        options={{
          title: 'En vivo',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="chart-line" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={History}
        options={{
          title: 'Registros',
          tabBarIcon: ({ color, size }) => <Ionicons name="folder-open-outline" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          title: 'Configuración',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="cog-outline" size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  barContainer: {
    alignSelf: 'center',
    width: '92%',         // no ocupa 100% (como el PDF)
    borderRadius: 26,
    overflow: 'hidden',   // recorta el gradient y la barra real
    ...Platform.select({
      android: { elevation: 14 },
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
    }),
  },
  bottomLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth * 2,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
});
