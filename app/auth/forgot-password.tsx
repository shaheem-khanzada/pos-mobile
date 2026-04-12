import React, { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { AuthScreenLayout } from '@/components/auth/auth-screen-layout';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { AlertCircleIcon, ChevronLeftIcon, Icon } from '@/components/ui/icon';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const emailInvalid = submitted && !emailPattern.test(email.trim());

  const onSendLink = useCallback(() => {
    setSubmitted(true);
    if (!emailPattern.test(email.trim())) return;
    router.push({
      pathname: '/auth/reset-password',
      params: { email: email.trim() },
    });
  }, [email, router]);

  return (
    <AuthScreenLayout>
      <VStack space="xl" className="w-full">
        <Pressable
          onPress={() => router.back()}
          className="-ml-1 flex-row items-center self-start py-2 pr-4"
        >
          <HStack space="xs" className="items-center">
            <Icon as={ChevronLeftIcon} className="text-typography-700" size="md" />
            <Text size="sm" className="text-typography-700 font-medium">
              Back
            </Text>
          </HStack>
        </Pressable>

        <Box>
          <Heading size="2xl" className="text-typography-900">
            Forgot password
          </Heading>
          <Text size="sm" className="mt-2 text-typography-500">
            Enter the email for your account. We will send you a link to choose a
            new password.
          </Text>
        </Box>

        <FormControl isInvalid={emailInvalid} isRequired>
          <FormControlLabel>
            <FormControlLabelText>Email</FormControlLabelText>
          </FormControlLabel>
          <Input>
            <InputField
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
          </Input>
          <FormControlHelper>
            <FormControlHelperText size="xs">
              Use the same email you use to sign in.
            </FormControlHelperText>
          </FormControlHelper>
          <FormControlError>
            <FormControlErrorIcon as={AlertCircleIcon} />
            <FormControlErrorText size="sm">
              Enter a valid email address.
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        <Button size="lg" className="w-full" onPress={onSendLink}>
          <ButtonText>Send reset link</ButtonText>
        </Button>
      </VStack>
    </AuthScreenLayout>
  );
}
