jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

import * as SecureStore from 'expo-secure-store';

import { sessionStorage } from '../session-storage.native';

const mockGetItemAsync = jest.mocked(SecureStore.getItemAsync);
const mockSetItemAsync = jest.mocked(SecureStore.setItemAsync);
const mockDeleteItemAsync = jest.mocked(SecureStore.deleteItemAsync);

describe('native session storage adapter', () => {
  test('delegates reads, writes, and removals to encrypted platform storage', async () => {
    mockGetItemAsync.mockResolvedValue('value');
    mockSetItemAsync.mockResolvedValue(undefined);
    mockDeleteItemAsync.mockResolvedValue(undefined);

    await expect(sessionStorage.getItem('session')).resolves.toBe('value');
    await sessionStorage.setItem('session', 'next');
    await sessionStorage.removeItem('session');

    expect(mockGetItemAsync).toHaveBeenCalledWith('session');
    expect(mockSetItemAsync).toHaveBeenCalledWith('session', 'next');
    expect(mockDeleteItemAsync).toHaveBeenCalledWith('session');
  });
});
