import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { Check, Tag, X } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Badge, BadgeIcon, BadgeText } from '@/components/ui/badge';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { cn } from '@/lib/cn';
import {
  fieldLabelClass,
  inputTextClass,
  sectionActionLinkClass,
} from '@/theme/ui';

export type SelectItem = { id: string; label: string };

type SelectSharedProps = {
  items: SelectItem[];
  title: string;
  onCreate?: (value: string) => void;
  onDelete?: (id: string) => void;
  actionTitle?: string;
  children?: ReactNode;
};

export type SelectSingleProps = SelectSharedProps & {
  mode?: 'single';
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export type SelectMultiProps = SelectSharedProps & {
  mode: 'multiple';
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
};

export type SelectProviderProps = SelectSingleProps | SelectMultiProps;

type SelectContextValue = {
  mode: 'single' | 'multiple';
  items: SelectItem[];
  title: string;
  selectedId: string | null;
  selectedIds: string[];
  onItemPress: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onCreate?: (value: string) => void;
  onDelete?: (id: string) => void;
  actionTitle?: string;
  isCreating: boolean;
  setIsCreating: Dispatch<SetStateAction<boolean>>;
};

const SelectContext = createContext<SelectContextValue | null>(
  null
);

function useSelectContext() {
  const ctx = useContext(SelectContext);
  if (!ctx) {
    throw new Error('Select context is missing.');
  }
  return ctx;
}

type SelectHeaderProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

function SelectHeader({
  title,
  actionLabel,
  onActionPress,
}: SelectHeaderProps) {
  return (
    <HStack className="w-full items-center justify-between">
      <Text className={cn(fieldLabelClass, 'ml-0.5')}>{title}</Text>
      {actionLabel && onActionPress ? (
        <Pressable
          onPress={onActionPress}
          className="active:opacity-80"
        >
          <Text className={sectionActionLinkClass}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </HStack>
  );
}

type SelectInputProps = {
  placeholder?: string;
  onSubmit: (value: string) => void;
};

function SelectInput({
  placeholder,
  onSubmit,
}: SelectInputProps) {
  const [draft, setDraft] = useState('');

  const handleSubmit = () => {
    const value = draft.trim();
    if (!value) return;
    onSubmit(value);
    setDraft('');
  };

  return (
    <HStack className="h-14 w-full items-center overflow-hidden rounded-3xl border border-primary-300 bg-primary-50 px-2.5 dark:border-primary-500 dark:bg-primary-950/25">
      <Box className="mr-2 h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100/80 dark:bg-primary-900/40">
        <Icon
          as={Tag}
          size="md"
          className="text-emerald-500"
        />
      </Box>
      <Input
        size="md"
        variant="outline"
        className="h-full min-h-0 min-w-0 flex-1 border-0 bg-transparent p-0"
      >
        <InputField
          className={cn(inputTextClass, 'h-full px-0')}
          placeholder={placeholder}
          value={draft}
          onChangeText={setDraft}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          autoFocus
        />
      </Input>
      <Pressable
        onPress={handleSubmit}
        className="ml-1.5 h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-500 active:bg-primary-600"
      >
        <Icon as={Check} className="text-typography-0" size="md" />
      </Pressable>
    </HStack>
  );
}

function Provider(props: SelectProviderProps) {
  const [isCreating, setIsCreating] = useState(false);
  const {
    items,
    title,
    onCreate,
    onDelete,
    actionTitle,
    children,
  } = props;
  const providerValue = useMemo<SelectContextValue>(() => {
    if (props.mode === 'multiple') {
      const { selectedIds, onSelectionChange } = props;
      return {
        mode: 'multiple',
        items,
        title,
        selectedId: null,
        selectedIds,
        onItemPress(id) {
          const next = selectedIds.includes(id)
            ? selectedIds.filter((x) => x !== id)
            : [...selectedIds, id];
          onSelectionChange(next);
        },
        onRemoveItem(id) {
          if (onDelete) onDelete(id);
          else onSelectionChange(selectedIds.filter((x) => x !== id));
        },
        onCreate,
        onDelete,
        actionTitle,
        isCreating,
        setIsCreating,
      };
    }
    const { selectedId, onSelect } = props;
    return {
      mode: 'single',
      items,
      title,
      selectedId,
      selectedIds: selectedId ? [selectedId] : [],
      onItemPress: onSelect,
      onRemoveItem(id) {
        onDelete?.(id);
      },
      onCreate,
      onDelete,
      actionTitle,
      isCreating,
      setIsCreating,
    };
  }, [props, items, title, onCreate, onDelete, actionTitle, isCreating]);

  return (
    <SelectContext.Provider value={providerValue}>
      {children}
    </SelectContext.Provider>
  );
}

function Frame({ children }: { children: ReactNode }) {
  return <VStack space="md" className="w-full shrink-0">{children}</VStack>;
}

function Header() {
  const {
    title,
    onCreate,
    actionTitle,
    isCreating,
    setIsCreating,
  } = useSelectContext();
  const canCreate = Boolean(onCreate);
  const actionLabel = canCreate ? (isCreating ? 'Cancel' : (actionTitle ?? '+ New')) : undefined;

  return (
    <SelectHeader
      title={title}
      actionLabel={actionLabel}
      onActionPress={canCreate ? () => setIsCreating((prev) => !prev) : undefined}
    />
  );
}

function AddRow() {
  const {
    onCreate,
    isCreating,
    setIsCreating,
  } = useSelectContext();

  if (!isCreating || !onCreate) return null;

  const handleCreate = (value: string) => {
    onCreate(value);
    setIsCreating(false);
  };

  return (
    <SelectInput
      onSubmit={handleCreate}
    />
  );
}

function List() {
  const { items } = useSelectContext();
  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      removeClippedSubviews={false}
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2"
    >
      {items.map((item) => (
        <SelectItem key={item.id} id={item.id} label={item.label} />
      ))}
    </ScrollView>
  );
}

type SelectItemProps = {
  id: string;
  label: string;
};

function SelectItem({
  id,
  label,
}: SelectItemProps) {
  const {
    mode,
    selectedId,
    selectedIds,
    onItemPress,
    onRemoveItem,
    onDelete,
  } = useSelectContext();
  const selected =
    mode === 'multiple' ? selectedIds.includes(id) : selectedId === id;
  const showRemove =
    selected && (onDelete != null || mode === 'multiple');

  return (
    <HStack className="items-center">
      <Pressable
        onPress={() => onItemPress(id)}
      >
        <Badge
          size="lg"
          variant="outline"
          action={selected ? 'success' : 'muted'}
          className="rounded-md py-2.5 px-4"
        >
          <BadgeText className="font-black">
            {label}
          </BadgeText>
          {showRemove ? (
            <Pressable
              onPress={() => onRemoveItem(id)}
              className="ml-2"
            >
              <BadgeIcon action="error" as={X} size="lg"/>
            </Pressable>
          ) : null}
        </Badge>
        
      </Pressable>
    </HStack>
  );
}

export const Select = {
  Provider,
  Frame,
  Header,
  AddRow,
  List,
};

type SelectSectionProps =
  | Omit<SelectSingleProps, 'children'>
  | Omit<SelectMultiProps, 'children'>;

export function SelectSection(props: SelectSectionProps) {
  return (
    <Select.Provider {...props}>
      <Select.Frame>
        <Select.Header />
        <Select.AddRow />
        <Select.List />
      </Select.Frame>
    </Select.Provider>
  );
}

export function useSelect() {
  return useSelectContext();
}
