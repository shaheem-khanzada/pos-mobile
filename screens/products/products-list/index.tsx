import { useMemo, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { Moon, Plus, Search, Sun } from 'lucide-react-native';
import { FlatList } from '@/components/ui/flat-list';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { Icon } from '@/components/ui/icon';
import { getCategoryLabel } from '@/lib/product-data-builders';
import { cn } from '@/lib/cn';
import { ProductListItem } from './components/product-list-item';
import { fieldLabelClass, standardInputClass } from '@/theme/ui';
import { useProductsListQuery } from '@/hooks/use-products-mutations';
import type { Product } from '@/payload/types';

export function ProductListScreen() {
  const router = useRouter();
  const { colorScheme, setColorScheme } = useColorScheme();
  const [searchText, setSearchText] = useState('');
  const productsQuery = useProductsListQuery({ limit: 30, sort: '-createdAt' });
  const products = productsQuery.data ?? [];

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchText.trim().toLowerCase();
    if (!normalizedQuery) return products;

    return products.filter(
      (item) =>
        item.title.toLowerCase().includes(normalizedQuery) ||
        (item.barcode ?? '').toLowerCase().includes(normalizedQuery)
    );
  }, [products, searchText]);

  const count = filteredProducts.length;

  const handleOpenProduct = (item: Product) => {
    router.push({
      pathname: '/tabs/edit-product/[id]',
      params: { id: item.id },
    });
  };

  const toggleColorScheme = () => {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <SafeAreaView
      className="flex-1 bg-app-page"
      edges={['top', 'left', 'right', 'bottom']}
    >
      <VStack className="flex-1 px-5 pt-4">
        <HStack className="items-center justify-between pb-6">
          <Pressable
            onPress={toggleColorScheme}
            className="h-11 w-11 items-center justify-center rounded-full bg-app-surface active:opacity-80"
            accessibilityRole="button"
            accessibilityLabel="Theme"
          >
            <Icon
              as={colorScheme === 'dark' ? Sun : Moon}
              className="text-emerald-500"
              size="md"
            />
          </Pressable>
          <Text className="text-xl font-bold text-typography-900">
            Products
          </Text>
          <Pressable
            onPress={() => router.push('/tabs/create-product')}
            className="h-11 w-11 items-center justify-center rounded-2xl bg-primary-100 active:opacity-90"
            accessibilityRole="button"
            accessibilityLabel="Add product"
          >
            <Icon
              as={Plus}
              size="md"
              className="text-emerald-500"
            />
          </Pressable>
        </HStack>

        <VStack className="flex-1" space="md">
          <Input
            size="lg"
            variant="outline"
            className={cn(standardInputClass, 'border-0 pl-0')}
          >
            <InputSlot className="justify-center pl-4 pr-2">
              <InputIcon
                as={Search}
                size="md"
                className="text-secondary-400"
              />
            </InputSlot>
            <InputField
              className="px-0 pr-4 text-sm text-typography-900 placeholder:text-typography-500"
              placeholder="Search products..."
              value={searchText}
              onChangeText={setSearchText}
            />
          </Input>

          <HStack className="items-center justify-between px-0.5">
            <Text className={fieldLabelClass}>My items</Text>
            <Box className="rounded-full bg-background-100 px-2.5 py-1 dark:bg-background-100">
              <Text className="text-2xs font-semibold text-typography-600 dark:text-typography-400">
                {count} {count === 1 ? 'Item' : 'Items'}
              </Text>
            </Box>
          </HStack>

          <Box className="flex-1">
            {productsQuery.isPending ? (
              <VStack className="flex-1 items-center justify-center gap-3">
                <ActivityIndicator size="small" />
                <Text className="text-sm text-typography-500">Loading products...</Text>
              </VStack>
            ) : (
              <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{
                  gap: 12,
                  paddingBottom: 24,
                }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <ProductListItem
                    product={item}
                    categoryLabel={getCategoryLabel(item.categories)}
                    onPress={handleOpenProduct}
                  />
                )}
                ListEmptyComponent={
                <Card
                  className={cn(
                    'rounded-2xl border border-outline-100 bg-background-0 p-4',
                    'dark:border-outline-800 dark:bg-background-50'
                  )}
                >
                  <Text className="text-center text-sm text-typography-500">
                    {searchText.trim()
                      ? `No products match "${searchText.trim()}".`
                      : 'No products yet.'}
                  </Text>
                </Card>
                }
              />
            )}
          </Box>
        </VStack>
      </VStack>
    </SafeAreaView>
  );
}
