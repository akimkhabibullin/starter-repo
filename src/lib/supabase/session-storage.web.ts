import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SessionStorage } from './session-storage.types';

const isServer = typeof window === 'undefined';

export const sessionStorage: SessionStorage = {
  getItem: (key) => (isServer ? null : AsyncStorage.getItem(key)),
  setItem: (key, value) => (isServer ? undefined : AsyncStorage.setItem(key, value)),
  removeItem: (key) => (isServer ? undefined : AsyncStorage.removeItem(key)),
};
