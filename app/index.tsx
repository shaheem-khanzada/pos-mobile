import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/auth/use-auth';

export default function Index() {
  const { isReady, isSignedIn } = useAuth();

  if (!isReady) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href="/tabs/orders" />;
  }

  return <Redirect href="/auth/login" />;
}
