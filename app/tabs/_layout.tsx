export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';

export default function AppLayout() {
  const { isReady, isSignedIn } = useAuth();

  if (!isReady) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
