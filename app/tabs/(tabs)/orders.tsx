import { Center } from '@/components/ui/center';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

export default function OrdersRoute() {
  return (
    <Center className="flex-1">
      <VStack space="lg" className="w-full max-w-md items-center px-4">
        <Heading className="font-bold text-2xl">Orders</Heading>
        <Divider className="my-[30px] w-[80%]" />
        <Text className="p-4 text-center">Orders list will appear here.</Text>
      </VStack>
    </Center>
  );
}
