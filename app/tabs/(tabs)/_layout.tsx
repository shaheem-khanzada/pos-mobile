import React from 'react';
import { Tabs } from 'expo-router';
import { Icon, MenuIcon, StarIcon, SettingsIcon } from '@/components/ui/icon';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => <Icon as={MenuIcon} color={color} size="md" />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: ({ color }) => <Icon as={StarIcon} color={color} size="md" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Icon as={SettingsIcon} color={color} size="md" />,
        }}
      />
    </Tabs>
  );
}
