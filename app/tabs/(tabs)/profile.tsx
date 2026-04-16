import { Button, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { VStack } from '@/components/ui/vstack';
import { useLogoutMutation } from '@/hooks/auth/use-auth-mutations';

export default function ProfileRoute() {
  const logoutMutation = useLogoutMutation();

  return (
    <Center className="flex-1">
      <VStack space="lg" className="w-full max-w-md items-center px-4">
        <Heading className="font-bold text-2xl">Profile</Heading>
        <Button
          action="secondary"
          variant="outline"
          size="sm"
          disabled={logoutMutation.isPending}
          onPress={() => logoutMutation.mutate()}
        >
          <ButtonText>{logoutMutation.isPending ? 'Signing out…' : 'Sign out'}</ButtonText>
        </Button>
      </VStack>
    </Center>
  );
}
