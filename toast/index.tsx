import { useCallback, useEffect, useRef } from 'react';
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Pressable } from '@/components/ui/pressable';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/cn';
import { clearToast, setToast, useToastStore, type ToastVariant } from '@/toast/store';

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

/**
 * Root-level listener for global app toast state.
 * Mount once in app root so any screen can call `setToast(...)`.
 */
export function AppToast() {
  const toast = useToastStore((s) => s.toast);
  const clear = useToastStore((s) => s.clearToast);
  const translateY = useSharedValue(140);
  const opacity = useSharedValue(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeToast = useCallback(() => {
    if (!toast) return;
    translateY.value = withTiming(140, {
      duration: 190,
      easing: Easing.out(Easing.quad),
    });
    opacity.value = withTiming(0, { duration: 160 }, (finished) => {
      if (finished) {
        runOnJS(clear)();
      }
    });
  }, [clear, opacity, toast, translateY]);

  useEffect(() => {
    if (!toast) return;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    translateY.value = 140;
    opacity.value = 0;
    translateY.value = withSpring(0, {
      damping: 18,
      stiffness: 210,
      mass: 0.8,
    });
    opacity.value = withTiming(1, { duration: 180 });
    const duration = toast.durationMs ?? 3200;
    timerRef.current = setTimeout(() => {
      closeToast();
    }, duration);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [closeToast, opacity, toast, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!toast) return null;

  const visual = visualByKind[toast.variant] ?? visualByKind.error;

  return (
    <VStack pointerEvents="box-none" className="absolute inset-0 z-[220] justify-end px-4 pb-6">
      <Animated.View style={animatedStyle}>
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
              {toast.title}
            </Text>
            {toast.description ? (
              <Text
                numberOfLines={2}
                className="mt-0.5 text-sm font-semibold text-secondary-500 dark:text-typography-400"
              >
                {toast.description}
              </Text>
            ) : null}
          </VStack>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close toast"
            onPress={closeToast}
            className="h-12 w-12 shrink-0 items-center justify-center rounded-full bg-background-100 active:opacity-80 dark:bg-background-200"
          >
            <Icon as={X} size="md" className="text-secondary-500 dark:text-typography-300" />
          </Pressable>
        </HStack>
      </Animated.View>
    </VStack>
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

