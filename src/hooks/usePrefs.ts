// src/hooks/usePrefs.ts
import { useEffect, useState } from 'react';

export type LaunchPref = 'default' | 'embed' | 'newTab';

export interface Prefs {
  animations: boolean;
  glow: boolean;
  launch: LaunchPref;
}

const STORAGE_KEY = 'luma-gaming-prefs';
const DEFAULTS: Prefs = { animations: true, glow: true, launch: 'default' };

export function usePrefs() {
  const [prefs, setPrefs] = useState<Prefs>(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
      if (!saved || typeof saved !== 'object') return DEFAULTS;
      const value = saved as Record<string, unknown>;
      return {
        animations: typeof value.animations === 'boolean' ? value.animations : DEFAULTS.animations,
        glow: typeof value.glow === 'boolean' ? value.glow : DEFAULTS.glow,
        launch: value.launch === 'embed' || value.launch === 'newTab' ? value.launch : 'default',
      };
    } catch {
      return DEFAULTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      /* stockage indisponible : les préférences restent en mémoire */
    }
  }, [prefs]);

  const setPref = <K extends keyof Prefs>(key: K, value: Prefs[K]) =>
    setPrefs((p) => ({ ...p, [key]: value }));

  return [prefs, setPref] as const;
}
