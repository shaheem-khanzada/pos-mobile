import { ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { CreateProductScreen } from '@/screens/products/create-product';
import { useProductByIdQuery } from '@/hooks/use-products-mutations';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';

export default function EditProductRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useProductByIdQuery(id);

  if (!id) {
    return (
      <Box className="flex-1 items-center justify-center bg-app-page p-6">
        <Text className="text-center text-typography-500">Missing product id.</Text>
      </Box>
    );
  }

  if (query.isPending) {
    return (
      <Box className="flex-1 items-center justify-center bg-app-page">
        <ActivityIndicator size="large" />
      </Box>
    );
  }

  if (query.isError || !query.data) {
    return (
      <Box className="flex-1 items-center justify-center bg-app-page p-6">
        <Text className="text-center text-typography-500">
          Could not load this product.
        </Text>
      </Box>
    );
  }

  return <CreateProductScreen product={query.data} />;
}
