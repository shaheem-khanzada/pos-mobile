import { useFormContext } from 'react-hook-form';
import { BottomSheetWrapper } from '@/components/app-bottom-sheet';
import { useMediaPicker } from '../../context/media-picker-context';
import type { ProductFormValues } from '../../form/types';
import { SelectProductImageSheet } from '../select-product-image-sheet';

export function ImagePickerSheet() {
  const { sheetRef, pickFromFile, pickExisting, close } = useMediaPicker();
  const { getValues } = useFormContext<ProductFormValues>();

  return (
    <BottomSheetWrapper ref={sheetRef} snapPoints={['40%', '60%']} enableDynamicSizing={false}>
      <SelectProductImageSheet
        onRequestClose={close}
        onImageSelected={(file) =>
          void pickFromFile(file, { fallbackAlt: getValues('title') })
        }
        onRecentMediaSelected={(selected) => pickExisting(selected)}
      />
    </BottomSheetWrapper>
  );
}
