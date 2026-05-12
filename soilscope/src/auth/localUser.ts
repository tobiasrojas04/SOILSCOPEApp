import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'soilscope_demo_user';

export type DemoUser = {
  email: string;
  password: string;
  remember: boolean;
  createdAt: string;
};

export async function saveUser(u: Omit<DemoUser,'createdAt'>) {
  const payload: DemoUser = { ...u, createdAt: new Date().toISOString() };
  await AsyncStorage.setItem(KEY, JSON.stringify(payload));
  return payload;
}

export async function getUser(): Promise<DemoUser | null> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) as DemoUser : null;
}

export async function clearUser() {
  await AsyncStorage.removeItem(KEY);
}
