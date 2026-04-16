import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { FlatList } from '@/components/ui/flat-list';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Image } from '@/components/ui/image';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Button, ButtonIcon } from '@/components/ui/button';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Fab, FabIcon } from '@/components/ui/fab';
import { Pressable } from '@/components/ui/pressable';
import {
  AddIcon,
  SearchIcon,
  TrashIcon,
} from '@/components/ui/icon';
import { useDeleteProductMutation, useProductsListQuery } from '@/hooks/use-products-mutations';
import type { Product as PayloadProduct } from '@/payload/payload-types';
import {
  getProductImageUrl,
  withMediaBaseUrl,
} from '@/components/products/product-form-shared';

function ProductListCard({
  product,
  onEdit,
  onDelete,
}: {
  product: PayloadProduct;
  onEdit: (item: PayloadProduct) => void;
  onDelete: (item: PayloadProduct) => void;
}) {
  const imageUrl = withMediaBaseUrl(getProductImageUrl(product.image));
  return (
    <Pressable onPress={() => onEdit(product)}>
      <Card className="rounded-2xl bg-white p-2.5">
        <HStack className="items-center" space="sm">
          <Image
            source={{ uri: imageUrl }}
            alt={product.name}
            className="h-20 w-20 rounded-xl"
            size="none"
          />
          <VStack className="flex-1" space="xs">
            <HStack className="items-start justify-between">
              <Text className="flex-1 text-base font-semibold text-typography-900" numberOfLines={1}>
                {product.name}
              </Text>
              <Badge action="error" variant="solid" className="rounded-full px-2 py-0.5">
                <BadgeText className="text-[10px] normal-case">Stock: {product.stock}</BadgeText>
              </Badge>
            </HStack>
            <Text className="text-xs leading-4 text-typography-500" numberOfLines={2}>
              {product.description}
            </Text>
            <HStack className="items-center justify-between pt-0.5">
              <Text className="text-xl font-bold text-primary-600">
                PKR {product.price.toFixed(2)}
              </Text>
              <Button
                size="sm"
                className="h-9 w-9 rounded-full bg-error-600 px-0"
                onPress={() => onDelete(product)}
              >
                <ButtonIcon as={TrashIcon} className="text-white" />
              </Button>
            </HStack>
          </VStack>
        </HStack>
      </Card>
    </Pressable>
  );
}

export function ProductListScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const deleteProductMutation = useDeleteProductMutation();
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isRefetching,
    refetch,
  } =
    useProductsListQuery({
      limit: 10,
      sort: '-createdAt',
    });

  const products = useMemo(() => {
    return data?.pages.flatMap((page) => page.docs) ?? [];
  }, [data]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchText.trim().toLowerCase();
    if (!normalizedQuery) return products;

    return products.filter(
      (item) =>
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery)
    );
  }, [products, searchText]);

  const handleEditProduct = (item: PayloadProduct) => {
    router.push({
      pathname: '/tabs/edit-product/[id]',
      params: {
        id: item.id,
        product: JSON.stringify(item),
      },
    });
  };
  const handleDeleteProduct = (item: PayloadProduct) => {
    deleteProductMutation.mutate(item);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-50" edges={['top', 'left', 'right', 'bottom']}>
      <VStack className="flex-1 px-4 pt-2" space="md">
        <HStack className="items-center">
          <Input variant="rounded" size="lg" className="flex-1 border-0 bg-white pr-1">
            <InputSlot className="pl-3">
              <InputIcon as={SearchIcon} />
            </InputSlot>
            <InputField
              placeholder="Search food..."
              value={searchText}
              onChangeText={setSearchText}
            />
          </Input>
        </HStack>

        <Box className="flex-1">
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              gap: 12,
              paddingBottom: 24,
            }}
            refreshing={isRefetching}
            onRefresh={refetch}
            showsVerticalScrollIndicator={false}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.4}
            renderItem={({ item }) => (
              <ProductListCard
                product={item}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            )}
            ListEmptyComponent={
              <Card className="rounded-2xl bg-white p-4">
                <Text className="text-center text-typography-500">
                  {isLoading
                    ? 'Loading products...'
                    : `No products found for "${searchText}".`}
                </Text>
              </Card>
            }
          />
        </Box>
      </VStack>
      <Fab placement="bottom right" onPress={() => router.push('/tabs/create-product')}>
        <FabIcon as={AddIcon} />
      </Fab>
    </SafeAreaView>
  );
}
