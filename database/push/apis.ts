import { payloadSdk } from '@/payload/sdk';

export async function createProductRemote(id: string, data: Record<string, unknown>) {
  return payloadSdk.create({
    collection: 'products',
    data: { id, ...data } as never,
  });
}

export async function updateProductRemote(id: string, data: Record<string, unknown>) {
  return payloadSdk.update({
    collection: 'products',
    id,
    data: data as never,
  });
}

export async function deleteProductRemote(id: string) {
  return payloadSdk.delete({
    collection: 'products',
    id,
  });
}

export async function createVariantRemote(id: string, data: Record<string, unknown>) {
  return payloadSdk.create({
    collection: 'variants',
    data: { id, ...data } as never,
  });
}

export async function updateVariantRemote(id: string, data: Record<string, unknown>) {
  return payloadSdk.update({
    collection: 'variants',
    id,
    data: data as never,
  });
}

export async function deleteVariantRemote(id: string) {
  return payloadSdk.delete({
    collection: 'variants',
    id,
  });
}

export async function createOrderRemote(id: string, data: Record<string, unknown>) {
  return payloadSdk.create({
    collection: 'carts',
    data: { id, ...data } as never,
  });
}

export async function updateOrderRemote(id: string, data: Record<string, unknown>) {
  return payloadSdk.update({
    collection: 'carts',
    id,
    data: data as never,
  });
}

export async function deleteOrderRemote(id: string) {
  return payloadSdk.delete({
    collection: 'carts',
    id,
  });
}
