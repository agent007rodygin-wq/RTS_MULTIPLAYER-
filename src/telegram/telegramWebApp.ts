// ─── Telegram Mini App bridge (2026-11 security pass) ────────────────────────
// Safe access to the Telegram WebApp SDK. The game runs as a normal website;
// when it is opened inside Telegram (Mini App), the SDK exposes a freshly
// signed `initData` string that the PocketBase hook
// (pb_hooks/security_utils.js → validateTelegramInitData) verifies via
// HMAC-SHA256 against the server-side bot token. The raw initData is opaque to
// the client — the server is the only party that can validate the signature.

interface TelegramWebAppUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

interface TelegramWebApp {
  initData?: string;
  initDataUnsafe?: { user?: TelegramWebAppUser };
  version?: string;
  platform?: string;
  colorScheme?: string;
  ready?: () => void;
  expand?: () => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

/** True when the page runs inside a Telegram Mini App webview. */
export function isTelegramWebApp(): boolean {
  return typeof window !== 'undefined'
    && typeof window.Telegram?.WebApp?.initData === 'string'
    && window.Telegram.WebApp.initData.length > 0;
}

/**
 * Returns the signed Telegram initData for the current Mini App session, or
 * null outside Telegram. Send it to the server on telegram-link / claim
 * calls — never trust a client-supplied user id on its own.
 */
export function getTelegramInitData(): string | null {
  try {
    const initData = window.Telegram?.WebApp?.initData;
    if (typeof initData === 'string' && initData.length > 0) return initData;
  } catch {
    // SDK not present or access blocked — outside Telegram this is expected.
  }
  return null;
}

/** Parsed (unsigned!) Telegram user info — display only, never authoritative. */
export function getTelegramUserUnsafe(): TelegramWebAppUser | null {
  try {
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
    return user && typeof user.id === 'number' ? user : null;
  } catch {
    return null;
  }
}

/** Signals readiness to Telegram so the webview expands (no-op elsewhere). */
export function notifyTelegramReady(): void {
  try {
    window.Telegram?.WebApp?.ready?.();
    window.Telegram?.WebApp?.expand?.();
  } catch {
    // no-op outside Telegram
  }
}
