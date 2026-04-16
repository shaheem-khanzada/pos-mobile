import { useLocalSearchParams } from 'expo-router';
import { EditProductScreen } from '@/components/products/edit-product-screen';
import type { Product } from '@/payload/payload-types';

export default function EditProductRoute() {
  const params = useLocalSearchParams<{
    id: string;
    product: string;
  }>();

  const product = JSON.parse(params.product) as Product;

  return <EditProductScreen product={product} />;
}
