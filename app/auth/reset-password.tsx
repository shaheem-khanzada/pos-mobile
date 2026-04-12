import React, { useCallback, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';
import { AuthScreenLayout } from '@/components/auth/auth-screen-layout';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
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
import {
  AlertCircleIcon,
  ChevronLeftIcon,
  EyeIcon,
  EyeOffIcon,
  Icon,
} from '@/components/ui/icon';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const passwordInvalid = submitted && password.length < 6;
  const confirmInvalid =
    submitted && (confirm.length === 0 || confirm !== password);

  const onUpdate = useCallback(async () => {
    setSubmitted(true);
    if (password.length < 6 || confirm !== password) return;
    await signOut();
    router.replace('/auth/login');
  }, [confirm, password, router, signOut]);

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
            {typeof email === 'string' && email
              ? `Choose a new password for ${email}.`
              : 'Choose a new password for your account.'}
          </Text>
        </Box>

        <VStack space="lg" className="w-full">
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

        <Button size="lg" className="w-full" onPress={onUpdate}>
          <ButtonText>Update password</ButtonText>
        </Button>
      </VStack>
    </AuthScreenLayout>
  );
}
