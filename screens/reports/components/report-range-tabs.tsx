import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { cn } from '@/lib/cn';
import type { ReportRange } from '../reports-view-model';

const OPTIONS: { id: ReportRange; label: string }[] = [
  { id: '1d', label: '1D' },
  { id: '7d', label: '7D' },
  { id: '30d', label: '30D' },
];

type ReportRangeTabsProps = {
  value: ReportRange;
  onChange: (v: ReportRange) => void;
};

export function ReportRangeTabs({ value, onChange }: ReportRangeTabsProps) {
  return (
    <HStack className="shrink-0 rounded-full border border-outline-100 bg-background-100 p-1 dark:border-outline-100 dark:bg-background-100">
      {OPTIONS.map((opt) => {
        const active = value === opt.id;
        return (
          <Pressable
            key={opt.id}
            onPress={() => onChange(opt.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${opt.label} range`}
            className={cn(
              'min-w-[44px] items-center rounded-full px-3 py-1.5',
              active && 'bg-primary-500 shadow-sm'
            )}
          >
            <Text
              className={cn(
                'text-xs font-bold',
                active
                  ? 'text-white'
                  : 'text-typography-500 dark:text-typography-400'
              )}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </HStack>
  );
}
