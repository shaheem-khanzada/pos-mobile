import { withObservables } from '@nozbe/watermelondb/react';
import { of as of$ } from 'rxjs';
import { Q } from '@nozbe/watermelondb';
import type Product from '@/database/model/Product';
import database, {
  defaultClauses,
  fetchCategoriesObservable,
  fetchVariantOptionsObservable,
  fetchVariantTypesObservable,
} from '@/database';
import type ProductVariant from '@/database/model/ProductVariant';
import { ProductEditorScreen } from './product-editor-screen';

type CreateProductScreenProps = {
  productId?: string;
  product?: Product | null;
};

const ObservedProductEditorScreen = withObservables(['product'], ({ product }) => ({
  variants: product?.id
    ? database
        .get<ProductVariant>('variants')
        .query(
          Q.where('product_id', product.id),
          ...defaultClauses()
        )
        .observe()
    : of$([]),
  variantTypes: fetchVariantTypesObservable(),
  variantOptions: fetchVariantOptionsObservable(),
  categories: fetchCategoriesObservable(),
  media: product ? product.media.observe() : of$(null),
}))(ProductEditorScreen);

export function CreateProductScreen({ product }: CreateProductScreenProps) {
  const isEdit = Boolean(product?.id);

  return (
    <ObservedProductEditorScreen
      product={product}
      screenTitle={isEdit ? product?.title ?? 'Edit Product' : 'Create Product'}
    />
  );
}

const enhance = withObservables(['productId'], ({ productId }) => ({
  product: productId ? database.get<Product>('products').findAndObserve(productId) : of$(null),
}));

export default enhance(CreateProductScreen);