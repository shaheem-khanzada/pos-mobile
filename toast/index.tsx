import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react-native';
import ToastMessage from 'react-native-toast-message';
import { Pressable } from '@/components/ui/pressable';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/cn';
import { clearToast, setToast, type ToastVariant } from '@/toast/store';

type VariantVisual = {
  icon: typeof CircleAlert;
  badgeClassName: string;
};

const visualByKind: Record<ToastVariant, VariantVisual> = {
  error: {
    icon: CircleAlert,
    badgeClassName: 'bg-error-500',
  },
  success: {
    icon: CircleCheck,
    badgeClassName: 'bg-success-500',
  },
  warning: {
    icon: TriangleAlert,
    badgeClassName: 'bg-warning-500',
  },
  info: {
    icon: Info,
    badgeClassName: 'bg-info-500',
  },
};

export function AppToast() {
  return (
    <ToastMessage
      position="top"
      topOffset={16}
      config={{
        appToast: ({ text1, text2, props }: any) => {
          const variant = (props?.variant as ToastVariant) ?? 'error';
          const visual = visualByKind[variant] ?? visualByKind.error;
          return (
            <VStack pointerEvents="box-none" className="w-full px-4">
              <HStack className="min-h-[88px] items-center gap-3 rounded-[30px] border border-outline-200 bg-app-surface px-4 py-4 shadow-hard-5 dark:border-outline-300">
                <HStack
                  className={cn(
                    'h-12 w-12 shrink-0 items-center justify-center rounded-full',
                    visual.badgeClassName
                  )}
                >
                  <Icon as={visual.icon} size="lg" className="text-white" />
                </HStack>

                <VStack className="min-w-0 flex-1 pr-1">
                  <Text className="text-xl font-bold text-typography-900 dark:text-typography-0">
                    {text1}
                  </Text>
                  {text2 ? (
                    <Text
                      numberOfLines={2}
                      className="mt-0.5 text-sm font-semibold text-secondary-500 dark:text-typography-400"
                    >
                      {text2}
                    </Text>
                  ) : null}
                </VStack>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close toast"
                  onPress={clearToast}
                  className="h-12 w-12 shrink-0 items-center justify-center rounded-full bg-background-100 active:opacity-80 dark:bg-background-200"
                >
                  <Icon
                    as={X}
                    size="md"
                    className="text-secondary-500 dark:text-typography-300"
                  />
                </Pressable>
              </HStack>
            </VStack>
          );
        },
      }}
    />
  );
}

export function useAppToast() {
  return {
    showError: (title: string, description?: string, durationMs?: number) =>
      setToast({ variant: 'error', title, description, durationMs }),
    showSuccess: (title: string, description?: string, durationMs?: number) =>
      setToast({ variant: 'success', title, description, durationMs }),
    showWarning: (title: string, description?: string, durationMs?: number) =>
      setToast({ variant: 'warning', title, description, durationMs }),
    showInfo: (title: string, description?: string, durationMs?: number) =>
      setToast({ variant: 'info', title, description, durationMs }),
    clear: () => clearToast(),
  };
}

