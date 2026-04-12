import React, { useCallback, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getApiErrorMessage } from '@/payload/errors';
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
import {
  AlertCircleIcon,
  ChevronLeftIcon,
  EyeIcon,
  EyeOffIcon,
  Icon,
} from '@/components/ui/icon';
import { useResetPasswordMutation } from '@/hooks/auth/use-auth-mutations';

function paramToString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; token?: string }>();
  const email = paramToString(params.email);
  const tokenFromLink = paramToString(params.token);

  const resetMutation = useResetPasswordMutation();
  const [tokenInput, setTokenInput] = useState(tokenFromLink ?? '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const effectiveToken = useMemo(
    () => (tokenFromLink ?? tokenInput).trim(),
    [tokenFromLink, tokenInput]
  );

  const passwordInvalid = submitted && password.length < 6;
  const confirmInvalid =
    submitted && (confirm.length === 0 || confirm !== password);
  const tokenInvalid = submitted && effectiveToken.length === 0;

  const onUpdate = useCallback(() => {
    setSubmitted(true);
    setServerError(null);
    if (effectiveToken.length === 0 || password.length < 6 || confirm !== password) {
      return;
    }
    /**
     * Payload returns a fresh JWT here — the mutation stores it and sends the user
     * straight into the tab shell so they do not have to sign in again.
     */
    resetMutation.mutate(
      { token: effectiveToken, password },
      {
        onError: (err) => {
          setServerError(getApiErrorMessage(err, 'Could not reset password'));
        },
      }
    );
  }, [confirm, effectiveToken, password, resetMutation]);

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
            Reset password
          </Heading>
          <Text size="sm" className="mt-2 text-typography-500">
            {email
              ? `Choose a new password for ${email}.`
              : 'Choose a new password for your account.'}
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
          {!tokenFromLink ? (
            <FormControl isInvalid={tokenInvalid} isRequired>
              <FormControlLabel>
                <FormControlLabelText>Reset token</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  placeholder="Paste token from email"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={tokenInput}
                  onChangeText={setTokenInput}
                />
              </Input>
              <FormControlHelper>
                <FormControlHelperText size="xs">
                  Deep links can pass ?token=…; otherwise paste the token Payload emailed you.
                </FormControlHelperText>
              </FormControlHelper>
              <FormControlError>
                <FormControlErrorIcon as={AlertCircleIcon} />
                <FormControlErrorText size="sm">
                  Token is required.
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
          ) : null}

          <FormControl isInvalid={passwordInvalid} isRequired>
            <FormControlLabel>
              <FormControlLabelText>New password</FormControlLabelText>
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
                Use at least 6 characters.
              </FormControlErrorText>
            </FormControlError>
          </FormControl>

          <FormControl isInvalid={confirmInvalid} isRequired>
            <FormControlLabel>
              <FormControlLabelText>Confirm password</FormControlLabelText>
            </FormControlLabel>
            <Input>
              <InputField
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirm}
                onChangeText={setConfirm}
              />
              <InputSlot className="pr-3" onPress={() => setShowConfirm((p) => !p)}>
                <InputIcon as={showConfirm ? EyeIcon : EyeOffIcon} />
              </InputSlot>
            </Input>
            <FormControlError>
              <FormControlErrorIcon as={AlertCircleIcon} />
              <FormControlErrorText size="sm">
                Passwords must match.
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        </VStack>

        <Button
          size="lg"
          className="w-full"
          onPress={onUpdate}
          disabled={resetMutation.isPending}
        >
          <ButtonText>
            {resetMutation.isPending ? 'Updating…' : 'Update password'}
          </ButtonText>
        </Button>
      </VStack>
    </AuthScreenLayout>
  );
}
