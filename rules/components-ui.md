# `components/ui` (Gluestack primitives)

**Do not edit files under `components/ui/`.** They are Gluestack-generated UI primitives. Custom behavior, styling conventions, and workarounds belong in app code, shared wrappers under `components/` (outside `ui/`), theme tokens, or Tailwind config — not by patching generated components.

If a change seems to require editing `components/ui/`, prefer:

- Using existing props and patterns documented by Gluestack.
- Composing primitives from screen/feature components.
- Extending tokens in `tailwind.config.js` or theme files when the issue is colors or typography.

This keeps upgrades and codegen predictable and avoids merge pain with upstream Gluestack output.
