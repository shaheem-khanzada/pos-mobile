import React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { Box } from '@/components/ui/box';
import { ScrollView } from '@/components/ui/scroll-view';
import { SafeAreaView } from '@/components/ui/safe-area-view';

type AuthScreenLayoutProps = {
  children: React.ReactNode;
};

export function AuthScreenLayout({ children }: AuthScreenLayoutProps) {
  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          className="flex-1"
          contentContainerClassName="grow px-5 py-6"
        >
          <Box className="w-full max-w-md self-center">{children}</Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
