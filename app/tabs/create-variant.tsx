import { useLocalSearchParams } from 'expo-router';
import { CreateVariantScreen } from '@/screens/products/create-variant';

export default function CreateVariantRoute() {
  const { variantId } = useLocalSearchParams<{ variantId?: string }>();
  return <CreateVariantScreen key={variantId ?? 'new'} />;
}
