export type ToastVariant = 'error' | 'success' | 'warning' | 'info';

export type Toast = {
  variant: ToastVariant;
  title: string;
  description?: string;
  durationMs?: number;
};

import ToastMessage from 'react-native-toast-message';

export function setToast(input: Toast) {
  ToastMessage.show({
    type: 'appToast',
    text1: input.title,
    text2: input.description,
    position: 'top',
    topOffset: 16,
    visibilityTime: input.durationMs ?? 3200,
    autoHide: true,
    props: {
      variant: input.variant,
    },
  });
}

export function clearToast() {
  ToastMessage.hide();
}
