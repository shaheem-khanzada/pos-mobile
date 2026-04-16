import type { Media, Product } from '@/payload/payload-types';
import { PAYLOAD_MEDIA_BASE_URL } from '@/lib/config';

export const CATEGORY_OPTIONS: Array<{
  label: string;
  value: NonNullable<Product['category']>;
}> = [
  { label: 'Food', value: 'food' },
  { label: 'Drink', value: 'drink' },
  { label: 'Clothes', value: 'clothes' },
  { label: 'Makeup', value: 'makeup' },
  { label: 'Other', value: 'other' },
];

const CATEGORY_VALUES = new Set(CATEGORY_OPTIONS.map((option) => option.value));

export function isValidCategory(value: string): value is NonNullable<Product['category']> {
  return CATEGORY_VALUES.has(value as NonNullable<Product['category']>);
}

export function getProductImageUrl(image?: Product['image']): string {
  if (!image) return '';
  if (typeof image === 'string') return image;
  return (image as Media | null)?.url ?? '';
}

export function withMediaBaseUrl(imageUrl: string): string {
  if (!imageUrl) return '';
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${PAYLOAD_MEDIA_BASE_URL}${imageUrl}`;
}

export type ProductFormValues = {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: NonNullable<Product['category']> | '';
};
