import React, { useCallback, useState } from 'react';
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
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { AlertCircleIcon, ChevronLeftIcon, Icon } from '@/components/ui/icon';
import { useForgotPasswordMutation } from '@/hooks/auth/use-auth-mutations';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const forgotMutation = useForgotPasswordMutation();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const emailInvalid = submitted && !emailPattern.test(email.trim());

  const onSendLink = useCallback(() => {
    setSubmitted(true);
    setServerError(null);
    if (!emailPattern.test(email.trim())) return;
    forgotMutation.mutate(
      { email: email.trim() },
      {
        onSuccess: () => {
          // Payload returns a generic success either way — same UX as the CMS.
          setSucceeded(true);
        },
        onError: (err) => {
          setServerError(getApiErrorMessage(err, 'Could not send reset email'));
        },
      }
    );
  }, [email, forgotMutation]);

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
            Enter the email for your account. If it exists, Payload will send a reset link
            (check spam too).
          </Text>
        </Box>

        {succeeded ? (
          <Box className="rounded-md border border-outline-200 bg-background-50 px-3 py-3">
            <Text size="sm" className="text-typography-700">
              If an account exists for that email, you will receive instructions shortly.
              Open the link on this device to finish on the reset password screen.
            </Text>
            <Button
              size="sm"
              variant="outline"
              action="secondary"
              className="mt-4 self-start"
              onPress={() => router.push('/auth/login')}
            >
              <ButtonText>Back to sign in</ButtonText>
            </Button>
          </Box>
        ) : (
          <>
            {serverError ? (
              <Box className="rounded-md border border-error-300 bg-error-50 px-3 py-2">
                <Text size="sm" className="text-error-700">
                  {serverError}
                </Text>
              </Box>
            ) : null}

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

            <Button
              size="lg"
              className="w-full"
              onPress={onSendLink}
              disabled={forgotMutation.isPending}
            >
              <ButtonText>
                {forgotMutation.isPending ? 'Sending…' : 'Send reset link'}
              </ButtonText>
            </Button>
          </>
        )}
      </VStack>
    </AuthScreenLayout>
  );
}
