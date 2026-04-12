import EditScreenInfo from '@/components/EditScreenInfo';
import { Button, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'expo-router';

export default function Tab1() {
  const router = useRouter();
  const { signOut } = useAuth();

  return (
    <Center className="flex-1">
      <VStack space="lg" className="w-full max-w-md items-center px-4">
        <Heading className="font-bold text-2xl">Expo - Tab 1</Heading>
        <Divider className="my-[30px] w-[80%]" />
        <Text className="p-4 text-center">
          Example below to use gluestack-ui components.
        </Text>
        <EditScreenInfo path="app/tabs/(tabs)/tab1.tsx" />
        <Button
          action="secondary"
          variant="outline"
          size="sm"
          className="mt-6"
          onPress={async () => {
            await signOut();
            router.replace('/auth/login');
          }}
        >
          <ButtonText>Sign out</ButtonText>
        </Button>
      </VStack>
    </Center>
  );
}
