# Screen modules and routing

## Where screen code lives

- **Route entry files** stay under **`app/`** only. Expo Router turns each route file into a URL; that tree should stay thin.
- **Screen implementations** live under **`screens/`** at the **repository root** (next to `app/`, `components/`), grouped by area:

  ```
  screens/
    auth/
      login.tsx
    products/
      create-product/
        index.tsx
        components/
      create-variant/
        index.tsx
        components/
      products-list/
        index.tsx          # e.g. `ProductListScreen`
        components/        # e.g. `product-list-row.tsx`
  ```

We use root-level **`screens/`** instead of `app/screens/` so Expo Router does not register an extra `/screens/...` segment or duplicate routes. `app/` remains the navigation shell; `screens/` holds feature UI.

## Adding a new screen

1. Add the implementation under `screens/<area>/<screen-name>/` (or `screens/<area>/<file>.tsx` for a single-file screen).
2. Add or update the route file under `app/` (e.g. `app/auth/login.tsx`) so it **re-exports** or **imports and renders** the screen from `@/screens/...`.
3. Keep URLs unchanged: only the location of the implementation moves, not the `app/` route path.

## Screen-only vs shared components

| Used in | Location |
|--------|----------|
| **One screen only** | `screens/<area>/<screen-name>/components/` (or alongside the screen file if tiny) |
| **Two or more screens** | `components/` at the repo root (shared app UI) |

Promote a component from screen-local to shared when a second screen needs it; avoid importing screen-local components from unrelated features.

## Gluestack UI

Do not edit **`components/ui/`** — see [components-ui.md](./components-ui.md).

## Icons on screens

Follow [icons.md](./icons.md) for Lucide + `Icon` usage.

## API data typing

Follow [api-data.md](./api-data.md) for Payload-first API typing and normalization rules.

## Cross-screen visual consistency

- Reuse existing screen patterns instead of creating near-duplicates.
- For product flows, keep the list and create-product screens visually aligned:
  - Header on products list should match create-product header style (same spacing, shell, and icon treatment), with only title/action differences required by UX.
  - Product list item card surfaces should reuse the same variation-row tokens/classes used in create-product (same border, background, radius, and chip styles).

## Accessibility code policy

- Do not add accessibility-related props or code in app screens/components.
- Specifically avoid adding fields such as `accessibilityLabel`, `accessibilityRole`, `accessibilityState`, `accessibilityHint`, and related accessibility handlers unless the user explicitly asks for them in that task.
