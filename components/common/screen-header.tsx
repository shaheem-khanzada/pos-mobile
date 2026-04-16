import type { ComponentProps } from 'react';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';

type HeaderIcon = ComponentProps<typeof Icon>['as'];

type ScreenHeaderProps = {
  title: string;
  leftIcon?: HeaderIcon;
  onLeftPress?: () => void;
  leftAccessibilityLabel?: string;
  rightIcon?: HeaderIcon;
  onRightPress?: () => void;
  rightAccessibilityLabel?: string;
};

function HeaderAction({
  icon,
  onPress,
  accessibilityLabel,
}: {
  icon?: HeaderIcon;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  if (!icon) return <Box className="h-12 w-12" />;

  return (
    <Pressable
      onPress={onPress}
      className="h-12 w-12 items-center justify-center rounded-full bg-white"
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={!onPress}
    >
      <Icon as={icon} className="text-typography-900" />
    </Pressable>
  );
}

export function ScreenHeader({
  title,
  leftIcon,
  onLeftPress,
  leftAccessibilityLabel,
  rightIcon,
  onRightPress,
  rightAccessibilityLabel,
}: ScreenHeaderProps) {
  return (
    <HStack className="items-center justify-between py-1">
      <HeaderAction
        icon={leftIcon}
        onPress={onLeftPress}
        accessibilityLabel={leftAccessibilityLabel}
      />
      <Text className="text-2xl font-semibold text-typography-900">{title}</Text>
      <HeaderAction
        icon={rightIcon}
        onPress={onRightPress}
        accessibilityLabel={rightAccessibilityLabel}
      />
    </HStack>
  );
}
