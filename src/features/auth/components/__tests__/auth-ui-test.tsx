import { fireEvent, render, screen } from '@testing-library/react-native';

import { AuthError, SubmitButton } from '../auth-ui';

describe('authentication UI primitives', () => {
  test('a disabled submit button prevents duplicate submission', async () => {
    const onPress = jest.fn();
    await render(<SubmitButton disabled label="Signing in…" onPress={onPress} testID="submit" />);

    await fireEvent.press(screen.getByRole('button', { name: 'Signing in…' }));
    expect(onPress).not.toHaveBeenCalled();
  });

  test('renders sanitized errors as alerts', async () => {
    await render(<AuthError message="The email or password is incorrect." />);
    expect(screen.getByRole('alert')).toHaveTextContent('The email or password is incorrect.');
  });
});
