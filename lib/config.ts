/**
 * Central API settings. Change these when you point at staging / production,
 * or when your Payload auth collection slug differs.
 *
 * Base URL comes from `.env` as `EXPO_PUBLIC_API_BASE_URL` — Expo only inlines
 * env vars that start with `EXPO_PUBLIC_`. Restart Metro (`npx expo start`) after
 * changing `.env`.
 *
 * Note for real devices: `http://localhost:3000` only works on the same machine
 * as the dev server. Use your computer's LAN IP (e.g. `http://192.168.1.5:3000`)
 * from a phone, or `http://10.0.2.2:3000` from the Android emulator.
 */

/** REST root PayloadSDK expects, e.g. `http://localhost:3000/api`. */
export const PAYLOAD_API_BASE_URL = `${process.env.EXPO_PUBLIC_API_BASE_URL}/api`;
