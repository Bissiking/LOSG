import { useEffect, useRef } from 'react';
import { createSystemButtonTracker } from '../lib/systemGamepad';
import { isSystemChord } from '../lib/gamepad';

/** Keep only the system shortcut active while the game owns normal inputs. */
export function useSystemButton(onToggle: () => void) {
  const handler = useRef(onToggle);
  handler.current = onToggle;
  useEffect(() => {
    if (!navigator.getGamepads) return;
    let frame = 0;
    let tracker = createSystemButtonTracker();
    let blocked = new Set<number>();
    const pads = () => {
      try { return Array.from(navigator.getGamepads()); } catch { return []; }
    };
    const poll = () => {
      frame = 0;
      const controllers = pads();
      if (document.hidden || !document.hasFocus() || !controllers.some((pad) => pad?.connected && pad.mapping === 'standard')) return;
      for (const index of blocked) if (!controllers.some((pad) => pad?.index === index && isSystemChord(pad))) blocked.delete(index);
      if (tracker(controllers.filter((pad) => pad && !blocked.has(pad.index)))) handler.current();
      frame = requestAnimationFrame(poll);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      tracker = createSystemButtonTracker();
      // Ignore a shortcut still held when returning from an OS overlay.
      blocked = new Set(pads().filter((pad) => pad && isSystemChord(pad)).map((pad) => pad!.index));
      if (!document.hidden) poll();
    };
    sync();
    window.addEventListener('gamepadconnected', sync);
    window.addEventListener('gamepaddisconnected', sync);
    window.addEventListener('focus', sync);
    window.addEventListener('blur', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('gamepadconnected', sync);
      window.removeEventListener('gamepaddisconnected', sync);
      window.removeEventListener('focus', sync);
      window.removeEventListener('blur', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);
}
