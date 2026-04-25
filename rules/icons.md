# Icons (Lucide + Gluestack `Icon`)

**Related:** [components-ui.md](./components-ui.md) — never modify `components/ui/` (including `icon`). Screen placement: [screens.md](./screens.md).

## Standard pattern

Use the shared **`Icon`** from `@/components/ui/icon` with components from **`lucide-react-native`** passed to the **`as`** prop. Style with **`size`** (Gluestack string tokens only) and **`className`** (Tailwind / theme colors).

```tsx
import { Trash2 } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';

<Icon
  as={Trash2}
  size="md"
  className="text-typography-500 dark:text-typography-400"
/>
```

## Rules

1. **Import icons from `lucide-react-native` only** — do not use FontAwesome or other icon packs in app screens unless a one-off exception is documented.
2. **Use `Icon` for standalone icons** — prefer `<Icon as={LucideComponent} />` instead of rendering `<LucideComponent />` directly, so sizing and `className` go through one wrapper.
3. **Color via `className`** — e.g. `text-primary-500`, `text-typography-900`, `dark:text-typography-400`. Avoid hardcoded `color="#…"` on Lucide.
4. **`size`** — use **only** the Gluestack `Icon` string tokens: `2xs` | `xs` | `sm` | `md` | `lg` | `xl`. Do not pass numeric sizes or change `components/ui/icon` to support new sizes; pick the closest token or adjust layout around the icon.
5. **Do not import** `ArrowLeftIcon`, `SunIcon`, etc. from `@/components/ui/icon` in screens — those are legacy Gluestack SVG wrappers. Use Lucide exports (`ArrowLeft`, `Sun`, `X`, `Check`, …) with `Icon as={…}` instead.
6. **Slots that already take `as`** — `InputIcon`, `ButtonIcon`, and similar may use the same Lucide components: `InputIcon as={Mail} className="…"`, `ButtonIcon as={ArrowRight} className="…"`.
7. **Errors / system icons** — `AlertCircleIcon` and other non-Lucide exports from `@/components/ui/icon` are fine when required by Gluestack form/button APIs.

## Lucide name hints

| Common UI        | `lucide-react-native` |
|-----------------|------------------------|
| Back            | `ArrowLeft`            |
| Close           | `X`                    |
| Check (mark)    | `Check`                |
| Delete row      | `Trash2`               |
