import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Package,
} from 'lucide-react-native';
import { getApiErrorMessage } from '@/payload/errors';
import { AuthScreenLayout } from '@/components/auth/auth-screen-layout';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { AlertCircleIcon, Icon } from '@/components/ui/icon';
import { useAuth } from '@/hooks/auth/use-auth';
import { useLoginMutation } from '@/hooks/auth/use-auth-mutations';
import { authInputClass, fieldLabelClass } from '@/theme/ui';

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
      router.replace('/tabs/orders');
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

  const footer = (
    <Text className="text-center text-sm leading-relaxed text-typography-500">
      Don&apos;t have an account?{' '}
      <Text className="text-sm font-bold text-emerald-500">
        Contact Admin
      </Text>
    </Text>
  );

  return (
    <AuthScreenLayout variant="centered-column" footer={footer}>
      <VStack space="2xl" className="w-full">
        <HStack className="w-full items-start justify-between">
          <Box className="rounded-3xl bg-primary-500 p-3.5 shadow-primary-glow-sm">
            <Icon as={Package} size="xl" className="text-typography-0" />
          </Box>
        </HStack>

        <Box>
          <Heading size="3xl" className="text-typography-900">
            Welcome Back
          </Heading>
          <Text size="md" className="mt-2 leading-relaxed text-typography-500">
            Sign in to manage your inventory and orders seamlessly.
          </Text>
        </Box>

        {serverError ? (
          <Box className="rounded-2xl border border-error-300 bg-background-error px-3 py-2.5">
            <Text size="sm" className="text-error-700">
              {serverError}
            </Text>
          </Box>
        ) : null}

        <VStack space="xl" className="w-full">
          <FormControl isInvalid={emailInvalid} isRequired>
            <FormControlLabel className="mb-2 ml-0.5">
              <FormControlLabelText className={fieldLabelClass}>
                Email address
              </FormControlLabelText>
            </FormControlLabel>
            <Input size="lg" variant="outline" className={authInputClass}>
              <InputSlot className="justify-center pl-5 pr-3">
                <InputIcon as={Mail} size="md" className="text-secondary-400" />
              </InputSlot>
              <InputField
                className="px-0 pr-4 text-sm text-typography-900 placeholder:text-typography-500"
                placeholder="admin@store.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </Input>
            <FormControlError>
              <FormControlErrorIcon as={AlertCircleIcon} />
              <FormControlErrorText size="sm">
                Enter a valid email address.
              </FormControlErrorText>
            </FormControlError>
          </FormControl>

          <FormControl isInvalid={passwordInvalid} isRequired>
            <FormControlLabel className="mb-2 ml-0.5">
              <FormControlLabelText className={fieldLabelClass}>
                Password
              </FormControlLabelText>
            </FormControlLabel>
            <Input size="lg" variant="outline" className={authInputClass}>
              <InputSlot className="justify-center pl-5 pr-3">
                <InputIcon as={Lock} size="md" className="text-secondary-400" />
              </InputSlot>
              <InputField
                className="px-0 pr-3 text-sm text-typography-900 placeholder:text-typography-500"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
              />
              <InputSlot className="justify-center pr-4 pl-1" onPress={() => setShowPassword((p) => !p)}>
                <InputIcon
                  as={showPassword ? Eye : EyeOff}
                  size="md"
                  className="text-secondary-400"
                />
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
            <Text className="text-xs font-bold uppercase tracking-wider text-emerald-500">
              Forgot password?
            </Text>
          </Pressable>
        </HStack>

        <Button
          size="xl"
          action="primary"
          className="mt-1 h-14 w-full rounded-2xl shadow-primary-glow-md"
          onPress={onSubmit}
          disabled={loginMutation.isPending}
        >
          <ButtonText className="text-sm font-bold uppercase tracking-wider">
            {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
          </ButtonText>
          {!loginMutation.isPending ? (
            <ButtonIcon as={ArrowRight} className="text-typography-0" />
          ) : null}
        </Button>
      </VStack>
    </AuthScreenLayout>
  );
}
