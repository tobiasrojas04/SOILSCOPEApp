import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import AppTabs from './src/screens/Tabs';
import Login from './src/screens/Login';
import { getUser } from './src/auth/localUser';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SettingsProvider } from './src/context/SettingsContext';


const Stack = createNativeStackNavigator();

export default function App() {
  const [ready, setReady]   = useState(false);
  const [hasUser, setHasUser] = useState(false);

  useEffect(() => {
    (async () => {
      const u = await getUser();       // leemos AsyncStorage (estado “log in simulado”)
      setHasUser(!!u);
      setReady(true);
    })();
  }, []);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}
            initialRouteName={hasUser ? 'App' : 'Login'}
          >
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="App" component={AppTabs} />
          </Stack.Navigator>
        </NavigationContainer>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
