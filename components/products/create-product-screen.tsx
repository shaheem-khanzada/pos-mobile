import { useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { ScreenHeader } from '@/components/common/screen-header';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { Input, InputField, InputSlot } from '@/components/ui/input';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { Box } from '@/components/ui/box';
import { Image } from '@/components/ui/image';
import { Button, ButtonText } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectItem,
} from '@/components/ui/select';
import { ArrowLeftIcon, ChevronDownIcon } from '@/components/ui/icon';
import { useCreateProductMutation } from '@/hooks/use-products-mutations';
import {
  CATEGORY_OPTIONS,
  isValidCategory,
  type ProductFormValues,
  withMediaBaseUrl,
} from '@/components/products/product-form-shared';

export function CreateProductScreen() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const createProductMutation = useCreateProductMutation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      stock: '',
      category: '',
    },
    mode: 'onSubmit',
  });

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.85,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setSelectedImage({
        uri: asset.uri,
        name: asset.fileName ?? `product-${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      });
    }
  };

  const onSubmit = async (values: ProductFormValues) => {
    if (!selectedImage || !values.category) return;

    await createProductMutation.mutateAsync({
      data: {
        name: values.name.trim(),
        description: values.description.trim(),
        price: Number(values.price),
        stock: Math.trunc(Number(values.stock)),
        category: values.category,
      },
      file: selectedImage,
      alt: values.name.trim(),
    });

    router.back();
  };

  const isSubmitting = createProductMutation.isPending;
  const imagePreviewUrl = withMediaBaseUrl(selectedImage?.uri ?? '');

  return (
    <SafeAreaView className="flex-1 bg-background-50" edges={['top', 'left', 'right', 'bottom']}>
      <VStack className="flex-1 px-4 pt-2">
        <ScreenHeader
          title="Add New Product"
          leftIcon={ArrowLeftIcon}
          onLeftPress={() => router.back()}
          leftAccessibilityLabel="Go back"
        />

        <Pressable
          onPress={pickImage}
          className="mx-auto mt-10 h-40 w-40 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-outline-300 bg-white"
        >
          {imagePreviewUrl ? (
            <Image source={{ uri: imagePreviewUrl }} alt="Selected product image" className="h-full w-full" size="none" />
          ) : (
            <FontAwesome name="image" size={28} color="#6B7280" />
          )}
        </Pressable>

        <VStack className="mt-10" space="md">
          <Controller
            control={control}
            name="name"
            rules={{ required: 'Name is required' }}
            render={({ field }) => (
              <VStack space="xs">
                <Input variant="rounded" size="lg" className="border-0 bg-white">
                  <InputSlot className="pl-3">
                    <FontAwesome name="shopping-bag" size={16} color="#9CA3AF" />
                  </InputSlot>
                  <InputField placeholder="Name" value={field.value} onChangeText={field.onChange} />
                </Input>
                {errors.name?.message ? <Text className="px-2 text-xs text-error-600">{errors.name.message}</Text> : null}
              </VStack>
            )}
          />

          <Box className="rounded-3xl bg-white px-4 py-3">
            <HStack className="items-start" space="sm">
              <FontAwesome name="align-left" size={16} color="#9CA3AF" style={{ marginTop: 6 }} />
              <Controller
                control={control}
                name="description"
                rules={{ required: 'Description is required' }}
                render={({ field }) => (
                  <Textarea className="h-24 flex-1 border-0 bg-transparent">
                    <TextareaInput placeholder="Short Description" value={field.value} onChangeText={field.onChange} />
                  </Textarea>
                )}
              />
            </HStack>
          </Box>

          <Controller
            control={control}
            name="category"
            rules={{ required: 'Category is required' }}
            render={({ field }) => (
              <Select selectedValue={field.value} onValueChange={(value) => isValidCategory(value) && field.onChange(value)}>
                <SelectTrigger variant="outline" size="lg" className="h-14 rounded-3xl border-0 bg-white px-4">
                  <FontAwesome name="th-large" size={16} color="#9CA3AF" />
                  <SelectInput placeholder="Category" className="ml-3 flex-1 text-lg text-[#9CA3AF]" />
                  <SelectIcon as={ChevronDownIcon} className="text-typography-900" />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    {CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} label={option.label} value={option.value} />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
            )}
          />

          <Controller
            control={control}
            name="price"
            rules={{ required: 'Price is required', validate: (value) => (!Number.isNaN(Number(value)) ? true : 'Enter a valid price') }}
            render={({ field }) => (
              <Input variant="rounded" size="lg" className="border-0 bg-white">
                <InputSlot className="pl-3">
                  <FontAwesome name="dollar" size={16} color="#9CA3AF" />
                </InputSlot>
                <InputField placeholder="Price" keyboardType="decimal-pad" value={field.value} onChangeText={field.onChange} />
              </Input>
            )}
          />

          <Controller
            control={control}
            name="stock"
            rules={{ required: 'Stock is required', validate: (value) => (!Number.isNaN(Number(value)) ? true : 'Enter valid stock') }}
            render={({ field }) => (
              <Input variant="rounded" size="lg" className="border-0 bg-white">
                <InputSlot className="pl-3">
                  <FontAwesome name="cube" size={15} color="#9CA3AF" />
                </InputSlot>
                <InputField placeholder="Stock" keyboardType="number-pad" value={field.value} onChangeText={field.onChange} />
              </Input>
            )}
          />
        </VStack>

        <Button className="mb-5 mt-auto h-14 rounded-full bg-primary-600" onPress={handleSubmit(onSubmit)} isDisabled={isSubmitting}>
          <ButtonText className="text-lg font-medium text-typography-0">{isSubmitting ? 'Creating...' : 'Create Product'}</ButtonText>
        </Button>
      </VStack>
    </SafeAreaView>
  );
}
