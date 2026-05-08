import { payloadSdk } from '@/payload/sdk';

export async function createProductRemote(data: Record<string, unknown>) {
  return payloadSdk.create({
    collection: 'products',
    data: data as never,
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

export async function createVariantRemote(data: Record<string, unknown>) {
  return payloadSdk.create({
    collection: 'variants',
    data: data as never,
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

export async function createCategoryRemote(data: Record<string, unknown>) {
  return payloadSdk.create({
    collection: 'categories',
    data: data as never,
  });
}

export async function updateCategoryRemote(id: string, data: Record<string, unknown>) {
  return payloadSdk.update({
    collection: 'categories',
    id,
    data: data as never,
  });
}

export async function deleteCategoryRemote(id: string) {
  return payloadSdk.delete({
    collection: 'categories',
    id,
  });
}

export async function createMediaRemote(data: Record<string, unknown>) {
  const maybeLocalUri = typeof data.url === 'string' ? data.url : null;
  const fileName = typeof data.fileName === 'string' ? data.fileName : null;
  const mimeType = typeof data.mimeType === 'string' ? data.mimeType : null;

  if (maybeLocalUri?.startsWith('file://') && fileName && mimeType) {
    const payloadData = {
      id: typeof data.id === 'string' ? data.id : undefined,
      alt: typeof data.alt === 'string' ? data.alt : '',
      tenant: data.tenant,
    };
    const formData = new FormData();
    formData.append('_payload', JSON.stringify(payloadData));
    formData.append('alt', payloadData.alt);
    formData.append('file', {
      uri: maybeLocalUri,
      name: fileName,
      type: mimeType,
    } as unknown as Blob);

    const uploadResponse = await payloadSdk.request({
      method: 'POST',
      path: '/media',
      init: { body: formData },
    });
    const mediaResponse = await uploadResponse.json();
    return mediaResponse?.doc ?? mediaResponse;
  }

  return payloadSdk.create({
    collection: 'media',
    data: data as never,
  });
}

export async function updateMediaRemote(id: string, data: Record<string, unknown>) {
  return payloadSdk.update({
    collection: 'media',
    id,
    data: data as never,
  });
}

export async function deleteMediaRemote(id: string) {
  return payloadSdk.delete({
    collection: 'media',
    id,
  });
}

export async function createVariantTypeRemote(data: Record<string, unknown>) {
  return payloadSdk.create({
    collection: 'variantTypes',
    data: data as never,
  });
}

export async function updateVariantTypeRemote(id: string, data: Record<string, unknown>) {
  return payloadSdk.update({
    collection: 'variantTypes',
    id,
    data: data as never,
  });
}

export async function deleteVariantTypeRemote(id: string) {
  return payloadSdk.delete({
    collection: 'variantTypes',
    id,
  });
}

export async function createVariantOptionRemote(data: Record<string, unknown>) {
  return payloadSdk.create({
    collection: 'variantOptions',
    data: data as never,
  });
}

export async function updateVariantOptionRemote(id: string, data: Record<string, unknown>) {
  return payloadSdk.update({
    collection: 'variantOptions',
    id,
    data: data as never,
  });
}

export async function deleteVariantOptionRemote(id: string) {
  return payloadSdk.delete({
    collection: 'variantOptions',
    id,
  });
}

export async function createOrderRemote(data: Record<string, unknown>) {
  return payloadSdk.create({
    collection: 'carts',
    data: data as never,
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
