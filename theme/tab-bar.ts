/**
 * Bottom tab bar colors for React Navigation `tabBarStyle` (StyleSheet API).
 * Values match `--color-background-0` and `--color-outline-200` in
 * `components/ui/gluestack-ui-provider/config.ts`.
 */
export const tabBarSurface = {
  light: {
    background: 'rgb(248, 249, 250)',
    borderTop: 'rgb(228, 228, 231)',
  },
  dark: {
    background: 'rgb(10, 10, 10)',
    borderTop: 'rgb(63, 63, 70)',
  },
} as const;
