import { useMemo } from 'react';
import { withObservables } from '@nozbe/watermelondb/react';
import type { CartItem } from '@/payload/types';
import { mapWmProductToCatalog, observeVariantsForProduct } from '@/database';
import type Product from '@/database/model/Product';
import type Media from '@/database/model/Media';
import type ProductVariant from '@/database/model/ProductVariant';
import {
  type CatalogProduct,
  qtyForCatalog,
} from '@/screens/orders/utils/product-catalog';
import { ProductPickerItem } from './product-picker-item';

type ProductPickerListItemProps = {
  product: Product;
  cartItems: CartItem[];
  onIncrement: (product: CatalogProduct) => void;
  onDecrement: (product: CatalogProduct) => void;
  onOpenVariantSheet: (product: CatalogProduct) => void;
};

function ProductPickerListItemBase({
  product,
  media,
  variants,
  cartItems,
  onIncrement,
  onDecrement,
  onOpenVariantSheet,
}: ProductPickerListItemProps & {
  media: Media | null;
  variants: ProductVariant[];
}) {
  const catalog = useMemo(
    () => mapWmProductToCatalog(product, media, variants),
    [product, media, variants]
  );

  return (
    <ProductPickerItem
      product={catalog}
      selectedQty={qtyForCatalog(cartItems, product.id)}
      onIncrement={() => onIncrement(catalog)}
      onDecrement={() => onDecrement(catalog)}
      onOpenVariantSheet={() => onOpenVariantSheet(catalog)}
    />
  );
}

export const ProductPickerListItem = withObservables(
  ['product'],
  ({ product }: ProductPickerListItemProps) => ({
    media: product.media.observe(),
    variants: observeVariantsForProduct(product.id),
  })
)(ProductPickerListItemBase);
