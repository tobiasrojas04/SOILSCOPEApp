import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Definimos qué datos va a manejar nuestro contexto
interface SettingsContextType {
  host: string;
  saveSettings: (newHost: string) => Promise<void>;
  isLoading: boolean;
  getBaseUrl: (protocol: 'http' | 'ws') => string;
}

const SettingsContext = createContext<SettingsContextType>({} as SettingsContextType);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  // Valor por defecto (tu IP actual para que no se rompa de una)
  const [host, setHost] = useState("192.168.0.143:8000"); 
  const [isLoading, setIsLoading] = useState(true);

  // 1. Al iniciar la app, intentamos leer la IP guardada en el celu
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedHost = await AsyncStorage.getItem('app_host');
        if (savedHost) setHost(savedHost);
      } catch (e) {
        console.error("Error cargando configuración", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  // 2. Función para guardar una nueva IP
  const saveSettings = async (newHost: string) => {
    try {
      await AsyncStorage.setItem('app_host', newHost);
      setHost(newHost); // Actualizamos el estado para que toda la app se entere
    } catch (e) {
      console.error("Error guardando configuración", e);
    }
  };

  // 3. Helper para armar las URLs fácil (http o ws)
  const getBaseUrl = (protocol: 'http' | 'ws') => {
    return `${protocol}://${host}`;
  };

  return (
    <SettingsContext.Provider value={{ host, saveSettings, isLoading, getBaseUrl }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Hook para usar esto fácil en tus componentes
export const useSettings = () => useContext(SettingsContext);