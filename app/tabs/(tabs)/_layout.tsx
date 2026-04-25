import React from 'react';
import { StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { LayoutGrid, ShoppingCart, User } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/cn';
import { tabBarSurface } from '@/theme/tab-bar';

function tabItemTextClass(focused: boolean) {
  return focused
    ? 'font-bold text-emerald-500'
    : 'font-normal text-typography-500 dark:text-typography-400';
}

function tabItemIconClass(focused: boolean) {
  return focused
    ? 'text-emerald-500'
    : 'text-typography-500 dark:text-typography-400';
}

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const surface = tabBarSurface[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: surface.background,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: surface.borderTop,
          elevation: 0,
        },
        tabBarActiveTintColor: 'transparent',
        tabBarInactiveTintColor: 'transparent',
      }}
    >
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: ({ focused }) => (
            <Icon
              as={LayoutGrid}
              size="md"
              className={tabItemIconClass(focused)}
            />
          ),
          tabBarLabel: ({ focused, children }) => (
            <Text className={cn('text-xs', tabItemTextClass(focused))}>
              {children}
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ focused }) => (
            <Icon
              as={ShoppingCart}
              size="md"
              className={tabItemIconClass(focused)}
            />
          ),
          tabBarLabel: ({ focused, children }) => (
            <Text className={cn('text-xs', tabItemTextClass(focused))}>
              {children}
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <Icon
              as={User}
              size="md"
              className={tabItemIconClass(focused)}
            />
          ),
          tabBarLabel: ({ focused, children }) => (
            <Text className={cn('text-xs', tabItemTextClass(focused))}>
              {children}
            </Text>
          ),
        }}
      />
    </Tabs>
  );
}
