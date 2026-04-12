import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';
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
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { AlertCircleIcon, EyeIcon, EyeOffIcon } from '@/components/ui/icon';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const router = useRouter();
  const { isReady, isSignedIn, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const emailInvalid = submitted && !emailPattern.test(email.trim());
  const passwordInvalid = submitted && password.length < 6;

  useEffect(() => {
    if (isReady && isSignedIn) {
      router.replace('/tabs/tab1');
    }
  }, [isReady, isSignedIn, router]);

  const onSubmit = useCallback(async () => {
    setSubmitted(true);
    if (!emailPattern.test(email.trim()) || password.length < 6) {
      return;
    }
    await signIn();
    router.replace('/tabs/tab1');
  }, [email, password, router, signIn]);

  return (
    <AuthScreenLayout>
      <VStack space="xl" className="w-full">
        <Box>
          <Heading size="2xl" className="text-typography-900">
            Sign in
          </Heading>
          <Text size="sm" className="mt-2 text-typography-500">
            Enter your email and password to continue.
          </Text>
        </Box>

        <VStack space="lg" className="w-full">
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
                We will never share your email.
              </FormControlHelperText>
            </FormControlHelper>
            <FormControlError>
              <FormControlErrorIcon as={AlertCircleIcon} />
              <FormControlErrorText size="sm">
                Enter a valid email address.
              </FormControlErrorText>
            </FormControlError>
          </FormControl>

          <FormControl isInvalid={passwordInvalid} isRequired>
            <FormControlLabel>
              <FormControlLabelText>Password</FormControlLabelText>
            </FormControlLabel>
            <Input>
              <InputField
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
              />
              <InputSlot className="pr-3" onPress={() => setShowPassword((p) => !p)}>
                <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
              </InputSlot>
            </Input>
            <FormControlError>
              <FormControlErrorIcon as={AlertCircleIcon} />
              <FormControlErrorText size="sm">
                Password must be at least 6 characters.
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        </VStack>

        <HStack className="w-full justify-end">
          <Pressable onPress={() => router.push('/auth/forgot-password')}>
            <Text size="sm" className="text-info-700 font-medium">
              Forgot password?
            </Text>
          </Pressable>
        </HStack>

        <Button size="lg" className="w-full" onPress={onSubmit}>
          <ButtonText>Sign in</ButtonText>
        </Button>
      </VStack>
    </AuthScreenLayout>
  );
}
