import type { Category, Product } from '@/payload/types';

export function getCategoryLabel(category?: Product['categories']): string {
  const first = category?.[0];
  if (!first) return '';
  if (typeof first === 'string') return first;
  return (first as Category).title;
}
