import { fireEvent, render, screen } from '@testing-library/react-native';

const mockRefetch = jest.fn();
let mockMapQuery = {
  data: undefined as [] | undefined,
  error: undefined as unknown,
  isError: false,
  isPending: true,
  refetch: mockRefetch,
};

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn((options: { enabled?: boolean }) =>
    options.enabled === false
      ? { data: undefined, error: undefined, isError: false, isPending: false, refetch: jest.fn() }
      : mockMapQuery,
  ),
  useMutation: jest.fn(() => ({
    error: undefined,
    isError: false,
    isPending: false,
    mutate: jest.fn(),
  })),
}));
jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('react-native-maps', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  const NativeMap = React.forwardRef(
    ({ children, testID }: { children?: React.ReactNode; testID?: string }, _ref) => (
      <View testID={testID}>{children}</View>
    ),
  );
  return {
    __esModule: true,
    default: NativeMap,
    Marker: ({ children }: { children?: React.ReactNode }) => <View>{children}</View>,
    Polygon: ({ children }: { children?: React.ReactNode }) => <View>{children}</View>,
    PROVIDER_GOOGLE: 'google',
  };
});
jest.mock('@/features/auth/auth-context', () => ({
  useAuth: () => ({ session: { user: { id: 'viewer-id' } }, restoring: false }),
}));
jest.mock('@/features/moderation/moderation-controls', () => ({
  BlockUserButton: () => null,
  ReportForm: () => null,
}));
jest.mock('@/lib/query/client', () => ({
  queryClient: { invalidateQueries: jest.fn() },
}));
jest.mock('@/lib/analytics', () => ({
  analytics: { capture: jest.fn(), identify: jest.fn(), reset: jest.fn() },
}));
jest.mock('../use-map-realtime', () => ({ useMapRealtime: jest.fn() }));

import { CollaborativeMapScreen } from '../map-screen';

describe('collaborative map query states', () => {
  beforeEach(() => {
    mockRefetch.mockReset();
    mockMapQuery = {
      data: undefined,
      error: undefined,
      isError: false,
      isPending: true,
      refetch: mockRefetch,
    };
  });

  test('renders loading state while the native map is mocked at its boundary', async () => {
    await render(<CollaborativeMapScreen />);
    expect(screen.getByTestId('collaborative-map')).toBeOnTheScreen();
    expect(screen.getByText('Loading this map area…')).toBeOnTheScreen();
  });

  test('renders an accessible empty state', async () => {
    mockMapQuery = { ...mockMapQuery, data: [], isPending: false };
    await render(<CollaborativeMapScreen />);
    expect(screen.getByText('No items in this area.')).toBeOnTheScreen();
  });

  test('renders a safe error and retries on user request', async () => {
    mockMapQuery = {
      ...mockMapQuery,
      error: { status: 500 },
      isError: true,
      isPending: false,
    };
    await render(<CollaborativeMapScreen />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'The service is temporarily unavailable. Try again shortly.',
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Retry map data' }));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });
});
