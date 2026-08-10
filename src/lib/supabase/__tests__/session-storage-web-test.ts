jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

import { sessionStorage } from '../session-storage.web';

const mockGetItem = jest.mocked(AsyncStorage.getItem);
const mockSetItem = jest.mocked(AsyncStorage.setItem);
const mockRemoveItem = jest.mocked(AsyncStorage.removeItem);

describe('web session storage adapter', () => {
  test('delegates browser persistence to AsyncStorage', async () => {
    mockGetItem.mockResolvedValue('value');
    mockSetItem.mockResolvedValue(undefined);
    mockRemoveItem.mockResolvedValue(undefined);

    await expect(sessionStorage.getItem('session')).resolves.toBe('value');
    await sessionStorage.setItem('session', 'value');
    await sessionStorage.removeItem('session');

    expect(mockGetItem).toHaveBeenCalledWith('session');
    expect(mockSetItem).toHaveBeenCalledWith('session', 'value');
    expect(mockRemoveItem).toHaveBeenCalledWith('session');
  });
});
