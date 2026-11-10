import { useEffect, useRef, useState } from 'react';
import { createPadActionReader, readGamepads, type PadAction } from '../lib/gamepad';
import { createPadScrollReader } from '../lib/padScroll';
export type { PadAction } from '../lib/gamepad';

export function useGamepad(enabled: boolean, onAction: (action: PadAction, pad: Gamepad) => void, onScroll?: (pixels: number) => void) {
  const handler = useRef(onAction);
  handler.current = onAction;
  const scrollHandler = useRef(onScroll);
  scrollHandler.current = onScroll;
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    let frame = 0;
    let read = createPadActionReader();
    let readScroll = createPadScrollReader();
    const poll = (time: number) => {
      frame = 0;
      const pads = readGamepads();
      setConnected(pads.some((pad) => pad.mapping === 'standard'));
      if (!enabled || document.hidden || !document.hasFocus()) return;
      for (const { pad, actions } of read(pads, time)) for (const action of actions) handler.current(action, pad);
      const pixels = readScroll(pads, time);
      if (pixels) scrollHandler.current?.(pixels);
      if (pads.length) frame = requestAnimationFrame(poll);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      read = createPadActionReader();
      readScroll = createPadScrollReader();
      poll(performance.now());
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
  }, [enabled]);
  return connected;
}
