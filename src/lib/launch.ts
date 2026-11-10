// src/lib/launch.ts
/** Reject protocols that cannot be safely opened as web games. Relative URLs stay supported. */
export function resolveGameUrl(value: string, base: string): string | null {
  if (!value.trim()) return null;
  try {
    const url = new URL(value, base);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}

/** Keep a Window reference to reliably detect a popup blocker, then isolate the opener. */
export function openGameTab(url: string): boolean {
  let tab: Window | null = null;
  try {
    tab = window.open('about:blank', '_blank');
    if (!tab) return false;
    tab.opener = null;
    tab.location.replace(url);
    return true;
  } catch {
    try { tab?.close(); } catch { /* The browser may already have closed it. */ }
    return false;
  }
}
