import { cn } from '@/lib/cn';

/** Section labels (Title *, Category *, Variant units, …) */
export const fieldLabelClass = cn(
  'text-label font-bold uppercase tracking-widest text-secondary-400'
);

/** Header actions — + New category, Cancel, + New variant */
export const sectionActionLinkClass = cn(
  'text-label font-bold uppercase tracking-widest text-emerald-500'
);

/** Focus ring matches selected pill / mint chips (`border-primary-300`, `bg-primary-50`, …) */
const pillInputFocusClass = cn(
  'data-[focus=true]:border-primary-300 data-[focus=true]:bg-primary-50',
  'dark:data-[focus=true]:border-primary-500 dark:data-[focus=true]:bg-primary-950/25'
);

/** Single-line fields — matches login pill height (`h-14`) */
export const standardInputClass = cn(
  'h-14 rounded-3xl border border-outline-100 bg-app-surface px-4 dark:border-outline-100',
  pillInputFocusClass
);

/** Auth inputs with leading/trailing slots — no horizontal padding on root */
export const authInputClass = cn(
  'h-14 rounded-3xl border border-outline-100 bg-app-surface dark:border-outline-100',
  pillInputFocusClass
);

/** Multiline description — apply on `Textarea` root (receives `data-[focus=true]`) */
export const fieldShellClass = cn(
  'rounded-2xl border border-outline-100 bg-app-surface px-4 py-2 dark:border-outline-100',
  pillInputFocusClass
);

/** Typed value — bold; no placeholder styling (product form omits placeholders) */
export const inputTextClass = cn('text-sm font-bold text-typography-900');

/** Border / fill / shadow shared by variation rows and primary actions (e.g. Save product) */
export const variationCardSurfaceClass = cn(
  'rounded-3xl border border-outline-100 bg-app-surface shadow-card-faint',
  'dark:border-outline-100 dark:shadow-card-faint'
);

/** Category / variant pill — container (`rounded-3xl` matches variation cards) */
export function pillChipContainerClassNames(selected: boolean) {
  return cn(
    'items-center overflow-hidden rounded-3xl border',
    selected
      ? 'border-primary-200 bg-app-pill-active-bg dark:border-primary-500/30'
      : 'border-outline-100 bg-app-surface dark:border-outline-100 dark:bg-app-surface'
  );
}

/** Category / variant pill — label text */
export function pillChipLabelClassNames(selected: boolean) {
  return cn(
    'text-xs font-bold uppercase tracking-wide',
    selected
      ? 'text-app-pill-active-fg'
      : 'text-typography-500 dark:text-typography-400'
  );
}

/**
 * Added variation rows — same outer radius as inputs (`rounded-3xl` / `standardInputClass`).
 */
export const variationRowCardClass = cn(
  'items-center justify-between px-5 py-4',
  variationCardSurfaceClass
);

/** Mini badges (qty, barcode, price) — small + bold, below title */
export const variationChipTextClass = cn(
  'text-2xs font-bold uppercase leading-tight tracking-wide'
);

export const variationNeutralChipClass = cn(
  'rounded-3xl border border-outline-100 bg-background-100 px-2 py-1',
  'dark:border-outline-700 dark:bg-background-100'
);

export const variationNeutralChipLabelClass = cn(
  variationChipTextClass,
  'text-typography-600 dark:text-typography-400'
);

/** Shared shell for price + barcode badges (same border / fill) */
const variationAccentMiniChipShell = cn(
  'rounded-3xl border border-primary-500/20 bg-primary-500/10 px-2 py-1'
);

/** Barcode row — same surface as price badge */
export const variationBarcodeChipClass = cn(
  'flex-row items-center gap-1',
  variationAccentMiniChipShell
);

export const variationBarcodeLabelClass = cn(
  variationChipTextClass,
  'text-primary-700 dark:text-primary-400'
);

/** Price cell */
export const variationPriceChipClass = cn(
  variationAccentMiniChipShell,
  variationChipTextClass,
  'text-primary-700 dark:text-primary-400'
);

export const variationTrashButtonClass = cn(
  'shrink-0 rounded-full bg-background-200/90 p-3 active:opacity-80',
  'dark:bg-background-100/80'
);
