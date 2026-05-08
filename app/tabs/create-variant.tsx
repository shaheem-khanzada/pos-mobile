import { Redirect } from 'expo-router';

/** Standalone variant editor was removed; variants are edited from the product screen. */
export default function CreateVariantRoute() {
  return <Redirect href="/tabs/products" />;
}
