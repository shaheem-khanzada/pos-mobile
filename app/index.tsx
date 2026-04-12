import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';

export default function Index() {
  const { isReady, isSignedIn } = useAuth();

  if (!isReady) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href="/tabs/tab1" />;
  }

  return <Redirect href="/auth/login" />;
}
