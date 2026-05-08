import Category from '../model/Category';
import Media from '../model/Media';
import Order from '../model/Order';
import OrderItem from '../model/OrderItem';
import Product from '../model/Product';
import ProductVariant from '../model/ProductVariant';
import VariantOption from '../model/VariantOption';
import VariantType from '../model/VariantType';

export function buildProductPushData(product: Product) {
  return {
    title: product.title,
    description: product.description ?? undefined,
    barcode: product.barcode ?? undefined,
    inventory: product.inventory ?? undefined,
    enableVariants: product.enableVariants ?? undefined,
    priceInPKREnabled: product.priceInPKREnabled ?? undefined,
    priceInPKR: product.priceInPKR ?? undefined,
    costInPKREnabled: product.costInPKREnabled ?? undefined,
    costInPKR: product.costInPKR ?? undefined,
    media: product.media.id ?? undefined,
    categories: Array.isArray(product.categories) ? product.categories : [],
    variantTypes: Array.isArray(product.variantTypes) ? product.variantTypes : [],
    tenant: product.tenant ?? undefined,
  };
}

export function buildVariantPushData(variant: ProductVariant) {
  const productId = (variant as any)._raw?.product_id ?? (variant as any).product?.id;
  return {
    barcode: variant.barcode ?? undefined,
    inventory: variant.inventory ?? undefined,
    priceInPKREnabled: variant.priceInPKREnabled ?? undefined,
    priceInPKR: variant.priceInPKR ?? undefined,
    costInPKREnabled: variant.costInPKREnabled ?? undefined,
    costInPKR: variant.costInPKR ?? undefined,
    options: Array.isArray(variant.options) ? variant.options : [],
    tenant: variant.tenant ?? undefined,
    product: productId,
  };
}

export function buildCategoryPushData(category: Category) {
  return {
    title: category.title,
    tenant: category.tenant ?? undefined,
  };
}

export function buildMediaPushData(media: Media) {
  return {
    alt: media.alt,
    url: media.url,
    fileName: media.fileName ?? undefined,
    mimeType: media.mimeType ?? undefined,
    tenant: media.tenant ?? undefined,
  };
}

export function buildVariantTypePushData(variantType: VariantType) {
  return {
    label: variantType.label,
    name: variantType.name,
    tenant: variantType.tenant ?? undefined,
  };
}

export function buildVariantOptionPushData(variantOption: VariantOption) {
  return {
    label: variantOption.label,
    value: variantOption.value,
    tenant: variantOption.tenant ?? undefined,
    variantType: variantOption.variantTypeId,
  };
}

export function buildOrderPushData(order: Order, items: OrderItem[]) {
  const payloadItems = items.map((item) => {
    const raw = (item as any)._raw ?? {};
    return {
      product: raw.product_id ?? null,
      variant: raw.variant_id ?? null,
      quantity: item.quantity,
      unitPriceInPKR: item.unitPriceInPKR ?? undefined,
      unitCostInPKR: item.unitCostInPKR ?? undefined,
    };
  });

  return {
    customerName: order.customerName,
    customerPhone: order.customerPhone ?? undefined,
    discount: order.discount ?? undefined,
    paymentMethod: order.paymentMethod,
    tenant: order.tenant ?? undefined,
    purchasedAt: order.purchasedAt ? order.purchasedAt.toISOString() : undefined,
    items: payloadItems,
  };
}
