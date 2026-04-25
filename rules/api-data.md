# API data typing rules

## Payload-first types

- Use generated types from `payload/payload-types.ts` as the source of truth for API request/response data.
- Do not create standalone DTO/mapper type systems for Payload API entities (products, variants, categories, media, etc.).
- For request payload shapes, compose from Payload types (`Product`, `Variant`, `Category`, `VariantOption`, etc.) instead of introducing parallel custom API models.

## Normalization strategy

- Keep API contracts unchanged and normalize only at UI boundaries before rendering or submitting.
- Prefer lightweight inline normalization in screen/context logic over adding mapper layers.
- Keep server-state data in Payload shape as much as possible.

## Practical conventions

- If a field is not present in generated Payload types but required by a custom endpoint (for example an extra request-only field), add the smallest local extension around the Payload type usage.
- Avoid exporting broad app-wide "API model" types that duplicate Payload schema fields.
- Do not use `filter((id): id is string => Boolean(id))` or similar inline type-predicate filters for relation IDs. Use a small explicit normalizer helper (loop/reduce) that handles `string | { id: string }` cleanly.
- When Payload marks relation arrays as required (for example `Product.categories`, `Product.media`), keep them required in local request types as well.
