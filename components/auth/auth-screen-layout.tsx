import React from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { Box } from '@/components/ui/box';
import { ScrollView } from '@/components/ui/scroll-view';
import { SafeAreaView } from '@/components/ui/safe-area-view';

type AuthScreenLayoutProps = {
  children: React.ReactNode;
  /**
   * `centered-column`: vertically centers main content; optional `footer` stays at bottom.
   * `scroll`: default — top-aligned scroll (forgot/reset flows).
   */
  variant?: 'scroll' | 'centered-column';
  footer?: React.ReactNode;
};

export function AuthScreenLayout({
  children,
  variant = 'scroll',
  footer,
}: AuthScreenLayoutProps) {
  if (variant === 'centered-column') {
    return (
      <SafeAreaView className="flex-1 bg-background-0">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <View className="flex-1">
            <ScrollView
              keyboardShouldPersistTaps="handled"
              className="flex-1"
              contentContainerClassName="min-h-full flex-grow justify-center px-8 py-10"
            >
              <Box className="w-full max-w-md self-center">{children}</Box>
            </ScrollView>
            {footer ? (
              <Box className="w-full max-w-md self-center px-8 pb-8 pt-4">
                {footer}
              </Box>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          className="flex-1"
          contentContainerClassName="grow justify-start px-5 py-8"
        >
          <Box className="w-full max-w-md self-center">{children}</Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
