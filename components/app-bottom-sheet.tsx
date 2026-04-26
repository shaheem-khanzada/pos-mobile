import type React from 'react';
import { StyleSheet, View } from 'react-native';
import { useColorScheme } from 'nativewind';
import {
  BottomSheetBackdrop as GorhomBottomSheetBackdrop,
  type BottomSheetBackdropProps as GorhomBottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {
  BottomSheetPortal,
} from '@/components/ui/bottomsheet';

type BottomSheetPortalProps = React.ComponentProps<typeof BottomSheetPortal>;

function BlurredBackdrop(props: GorhomBottomSheetBackdropProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      props.animatedIndex.value,
      [-1, 0, 1],
      [0, 0, 1],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFillObject, animatedStyle]}
    >
      <BlurView
        intensity={15}
        tint="default"
        style={StyleSheet.absoluteFillObject}
      />
      <View
        pointerEvents="none"
        style={StyleSheet.absoluteFillObject}
        className="bg-black/20 dark:bg-black/80"
      />
      <GorhomBottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={1}
        opacity={0.2}
      />
    </Animated.View>
  );
}

/**
 * App-level wrapper around the UI bottom-sheet portal.
 * Keeps app defaults out of `components/ui/*`.
 */
export function BotomSheetWrapper({
  children,
  enablePanDownToClose = true,
  ...props
}: BottomSheetPortalProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <BottomSheetPortal
      {...props}
      enablePanDownToClose={enablePanDownToClose}
      style={{
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: 'hidden',
      }}
      backdropComponent={(backdropProps: GorhomBottomSheetBackdropProps) => (
        <BlurredBackdrop {...backdropProps} />
      )}
      handleStyle={{
        backgroundColor: isDark ? '#121212' : '#FFFFFF',
      }}
      handleIndicatorStyle={{
        backgroundColor: isDark ? '#10B981' : '#059669',
      }}
    >
      {children}
    </BottomSheetPortal>
  );
}
