import { Camera, ChevronRight, LogOut, Printer, Shield, Store, Sun, User, Users } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { ScrollView } from '@/components/ui/scroll-view';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { useLogoutMutation } from '@/hooks/auth/use-auth-mutations';
import { cn } from '@/lib/cn';
import { fieldLabelClass, variationCardSurfaceClass } from '@/theme/ui';

type ProfileMenuRowProps = {
  icon: typeof User;
  title: string;
  subtitle: string;
  onPress?: () => void;
};

function ProfileMenuRow({ icon, title, subtitle, onPress }: ProfileMenuRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'flex-row items-center gap-3 rounded-3xl px-4 py-3 active:opacity-90',
        variationCardSurfaceClass
      )}
    >
      <Box className="h-12 w-12 items-center justify-center rounded-xl bg-background-100 dark:bg-background-100">
        <Icon as={icon} size="md" className="text-secondary-500 dark:text-secondary-400" />
      </Box>
      <VStack className="min-w-0 flex-1">
        <Text className="text-xl font-bold text-typography-900 dark:text-typography-0">{title}</Text>
        <Text className="text-sm text-secondary-500 dark:text-typography-400">{subtitle}</Text>
      </VStack>
      <Icon as={ChevronRight} size="md" className="text-secondary-500" />
    </Pressable>
  );
}

export function ProfileScreen() {
  const router = useRouter();
  const logoutMutation = useLogoutMutation();

  return (
    <SafeAreaView className="flex-1 bg-app-page" edges={['top', 'left', 'right']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-10 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <VStack space="xl" className="w-full">
          <HStack className="items-center justify-between">
            <Text className="text-3xl font-bold text-typography-900 dark:text-typography-0">
              Account
            </Text>
            <Pressable className="h-11 w-11 items-center justify-center rounded-2xl bg-background-100 active:opacity-80 dark:bg-background-100">
              <Icon as={Sun} size="md" className="text-yellow-500" />
            </Pressable>
          </HStack>

          <VStack className={cn('items-center rounded-[32px] px-5 py-7', variationCardSurfaceClass)}>
            <Box className="relative mb-4">
              <Box className="h-32 w-32 items-center justify-center rounded-[28px] bg-background-100 dark:bg-background-100">
                <Icon as={User} size="xl" className="text-secondary-500 dark:text-secondary-400" />
              </Box>
              <Pressable className="absolute -bottom-1 -right-1 h-11 w-11 items-center justify-center rounded-2xl bg-primary-500 shadow-sm active:opacity-90">
                <Icon as={Camera} size="sm" className="text-white" />
              </Pressable>
            </Box>

            <Text className="text-3xl font-bold text-typography-900 dark:text-typography-0">
              Haris Khan
            </Text>
            <Text className="mt-1 text-base text-secondary-500 dark:text-typography-400">
              haris@store.com • Admin
            </Text>
          </VStack>

          <VStack space="md">
            <Text className={fieldLabelClass}>Personal settings</Text>
            <VStack space="md">
              <ProfileMenuRow
                icon={User}
                title="Edit Name"
                subtitle="Change your display name"
              />
              <ProfileMenuRow
                icon={Shield}
                title="Change Password"
                subtitle="Secure your account"
              />
            </VStack>
          </VStack>

          <VStack space="md">
            <Text className={fieldLabelClass}>Workspace</Text>
            <VStack space="md">
              <ProfileMenuRow
                icon={Store}
                title="Manage Stores"
                subtitle="3 Stores linked"
              />
              <ProfileMenuRow
                icon={Users}
                title="Manage Users"
                subtitle="Permissions & Roles"
              />
              <ProfileMenuRow
                icon={Printer}
                title="Manage Printers"
                subtitle="Receipt printer & discovery"
                onPress={() => router.push('/tabs/printers')}
              />
            </VStack>
          </VStack>

          <Pressable
            onPress={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className={cn(
              'mt-3 h-14 w-full flex-row items-center justify-center gap-2 rounded-3xl bg-red-500 active:opacity-90',
              logoutMutation.isPending && 'opacity-70'
            )}
            accessibilityRole="button"
            accessibilityLabel="Log out"
          >
            <Icon as={LogOut} size="sm" className="text-white" />
            <Text className="text-base font-bold text-white">
              {logoutMutation.isPending ? 'Logging out...' : 'Log out'}
            </Text>
          </Pressable>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
