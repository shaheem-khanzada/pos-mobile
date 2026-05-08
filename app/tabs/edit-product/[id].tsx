import { useLocalSearchParams } from 'expo-router';
import CreateProductScreen from '@/screens/products/create-product';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';

export default function EditProductRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) {
    return (
      <Box className="flex-1 items-center justify-center bg-app-page p-6">
        <Text className="text-center text-typography-500">Missing product id.</Text>
      </Box>
    );
  }

  return <CreateProductScreen productId={id} />;
}
