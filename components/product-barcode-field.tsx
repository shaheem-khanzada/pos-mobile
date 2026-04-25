import { Barcode, ScanLine } from 'lucide-react-native';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { cn } from '@/lib/cn';
import { authInputClass, fieldLabelClass, inputTextClass } from '@/theme/ui';

type ProductBarcodeFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  onPressScan?: () => void;
};

export function ProductBarcodeField({
  value,
  onChangeText,
  onPressScan,
}: ProductBarcodeFieldProps) {
  return (
    <VStack space="sm" className="w-full shrink-0">
      <Text className={cn(fieldLabelClass, 'ml-0.5')}>Product barcode</Text>
      <Input size="lg" variant="outline" className={authInputClass}>
        <InputSlot className="justify-center pl-4 pr-2">
          <InputIcon
            as={Barcode}
            size="md"
            className="text-secondary-400"
          />
        </InputSlot>
        <InputField
          className={cn(inputTextClass, 'min-w-0 flex-1 px-0 pr-2')}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <InputSlot
          className="justify-center pr-2.5 pl-1"
          onPress={onPressScan}
        >
          <HStack className="items-center gap-1.5">
            <Icon as={ScanLine} size="sm" className="text-emerald-400" />
            <Text className="text-label font-bold uppercase tracking-wide text-emerald-400">
              Scan
            </Text>
          </HStack>
        </InputSlot>
      </Input>
    </VStack>
  );
}
