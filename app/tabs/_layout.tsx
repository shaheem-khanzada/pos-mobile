export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/hooks/auth/use-auth';
import { useDatabaseSync } from '@/hooks/database/use-database-sync';

export default function AppLayout() {
  const { isReady, isSignedIn } = useAuth();
  useDatabaseSync({ pageSize: 100 });

  if (!isReady) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="create-product"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="create-variant"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="create-order"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="select-products"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="barcode-scanner"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="printers"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="edit-product/[id]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
