import { useMutation, useQuery } from '@tanstack/react-query';

import type { Media } from '@/payload/types';
import { payloadSdk } from '@/payload/sdk';
import { showApiErrorToast } from '@/toast/api-toast';

export type UploadableFile = {
  uri: string;
  name: string;
  type: string;
};

function withTimestampFileName(fileName: string): string {
  const safeName = fileName.trim() || 'upload.jpg';
  const dotIndex = safeName.lastIndexOf('.');
  const hasExtension = dotIndex > 0 && dotIndex < safeName.length - 1;
  const base = hasExtension ? safeName.slice(0, dotIndex) : safeName;
  const ext = hasExtension ? safeName.slice(dotIndex) : '';
  return `${base}-${Date.now()}${ext}`;
}

async function uploadMediaFile(file: UploadableFile, alt: string): Promise<string> {
  const uniqueName = withTimestampFileName(file.name);
  const formData = new FormData();
  formData.append('_payload', JSON.stringify({ alt }));
  formData.append('alt', alt);
  formData.append('file', {
    uri: file.uri,
    name: uniqueName,
    type: file.type,
  } as unknown as Blob);

  const uploadResponse = await payloadSdk.request({
    method: 'POST',
    path: '/media',
    init: {
      body: formData,
    },
  });
  const mediaResponse = await uploadResponse.json();
  return mediaResponse?.doc?.id as string;
}

function toMediaId(media: string | Media) {
  if (typeof media === 'string') return media;
  return media.id;
}

export function useMediaMutation() {
  return useMutation({
    mutationFn: async ({
      file,
      altSeed,
      existingMedia,
    }: {
      file?: UploadableFile;
      altSeed: string;
      existingMedia?: string | Media;
    }) => {
      if (file) {
        return uploadMediaFile(file, altSeed);
      }
      if (!existingMedia) {
        throw new Error('Media is required');
      }
      return toMediaId(existingMedia);
    },
    onError: (error) => {
      showApiErrorToast('Upload media', error);
    },
  });
}

export function useMediaListQuery(params?: { limit?: number }) {
  return useQuery({
    queryKey: ['media', { limit: params?.limit ?? 24 }],
    queryFn: async () => {
      const limit = params?.limit ?? 24;
      const res = await payloadSdk.find({
        collection: 'media',
        limit,
        sort: '-createdAt',
      });
      return res
    },
    select: (data) => data.docs as Media[],
  });
}
