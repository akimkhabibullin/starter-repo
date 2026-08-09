export type AuthRouteState = 'loading' | 'public' | 'authenticated';

export function getAuthRouteState(restoring: boolean, hasSession: boolean): AuthRouteState {
  if (restoring) return 'loading';
  return hasSession ? 'authenticated' : 'public';
}
