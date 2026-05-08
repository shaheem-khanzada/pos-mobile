import React, { forwardRef, useCallback } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useColorScheme } from 'nativewind';
import GorhomBottomSheet, {
  BottomSheetBackdrop as GorhomBottomSheetBackdrop,
  type BottomSheetBackdropProps as GorhomBottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useBottomSheetContext } from '@/components/ui/bottomsheet';

type IBottomSheetProps = React.ComponentProps<typeof GorhomBottomSheet>;

export type BottomSheetWrapperProps = Partial<IBottomSheetProps> & {
  snapPoints: string[];
  children?: React.ReactNode;
};

function IOSBlurredBackdrop(props: GorhomBottomSheetBackdropProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      props.animatedIndex.value,
      [-1, 0, 1],
      [0, 0, 1],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, animatedStyle]}>
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

function BlurredBackdrop(props: GorhomBottomSheetBackdropProps) {
  if (Platform.OS === 'android') {
    // expo-blur BlurView + full-screen Animated wrapper still receive touches on Android
    // when the sheet is closed (index -1), blocking the main screen.
    return (
      <GorhomBottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={1}
        opacity={0.35}
      />
    );
  }

  return <IOSBlurredBackdrop {...props} />;
}

/**
 * App-level sheet: mirrors UI BottomSheetPortal behavior + app styling,
 * with merged refs so imperative `ref` (create-product) and context ref (orders) both work.
 * Implemented here so `components/ui/*` stays untouched.
 */
export const BottomSheetWrapper = forwardRef<GorhomBottomSheet, BottomSheetWrapperProps>(
  function BottomSheetWrapper(props, forwardedRef) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { bottomSheetRef, handleClose } = useBottomSheetContext();

    const {
      snapPoints,
      handleComponent: DragIndicator,
      backdropComponent: _omitBackdrop,
      children,
      ...rest
    } = props;

    const handleSheetChanges = useCallback(
      (index: number) => {
        if (index === 0 || index === -1) {
          handleClose();
        }
      },
      [handleClose]
    );

    const setMergedRef = useCallback(
      (node: GorhomBottomSheet | null) => {
        (bottomSheetRef as React.MutableRefObject<GorhomBottomSheet | null>).current = node;
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef != null) {
          (forwardedRef as React.MutableRefObject<GorhomBottomSheet | null>).current = node;
        }
      },
      [bottomSheetRef, forwardedRef]
    );

    return (
      <GorhomBottomSheet
        ref={setMergedRef}
        snapPoints={snapPoints}
        index={-1}
        backdropComponent={(backdropProps: GorhomBottomSheetBackdropProps) => (
          <BlurredBackdrop {...backdropProps} />
        )}
        onChange={handleSheetChanges}
        handleComponent={DragIndicator}
        enablePanDownToClose={true}
        {...rest}
        style={{
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          overflow: 'hidden',
        }}
        handleStyle={{
          backgroundColor: isDark ? '#121212' : '#FFFFFF',
        }}
        handleIndicatorStyle={{
          backgroundColor: isDark ? '#10B981' : '#059669',
        }}
      >
        {children}
      </GorhomBottomSheet>
    );
  }
);

BottomSheetWrapper.displayName = 'BottomSheetWrapper';
