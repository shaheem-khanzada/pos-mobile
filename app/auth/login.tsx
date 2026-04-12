import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { getApiErrorMessage } from '@/api/http/errors';
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
import { useAuth } from '@/contexts/auth-context';
import { useLoginMutation } from '@/hooks/auth/use-auth-mutations';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const router = useRouter();
  const { isReady, isSignedIn } = useAuth();
  const loginMutation = useLoginMutation();
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const emailInvalid = submitted && !emailPattern.test(email.trim());
  const passwordInvalid = submitted && password.length < 6;

  useEffect(() => {
    if (isReady && isSignedIn) {
      router.replace('/tabs/tab1');
    }
  }, [isReady, isSignedIn, router]);

  const onSubmit = useCallback(() => {
    setSubmitted(true);
    setServerError(null);
    if (!emailPattern.test(email.trim()) || password.length < 6) {
      return;
    }
    loginMutation.mutate(
      { email: email.trim(), password },
      {
        onError: (err) => {
          setServerError(getApiErrorMessage(err, 'Sign in failed'));
        },
      }
    );
  }, [email, password, loginMutation]);

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

        {serverError ? (
          <Box className="rounded-md border border-error-300 bg-error-50 px-3 py-2">
            <Text size="sm" className="text-error-700">
              {serverError}
            </Text>
          </Box>
        ) : null}

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

        <Button
          size="lg"
          className="w-full"
          onPress={onSubmit}
          disabled={loginMutation.isPending}
        >
          <ButtonText>
            {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
          </ButtonText>
        </Button>
      </VStack>
    </AuthScreenLayout>
  );
}
