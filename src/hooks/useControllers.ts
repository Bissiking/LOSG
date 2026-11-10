import { useEffect, useState } from 'react';
import { describeControllers, readGamepads, type ControllerInfo } from '../lib/gamepad';
export function useControllers() {
  const [controllers, setControllers] = useState<ControllerInfo[]>([]);
  useEffect(() => {
    const sync = () => {
      const next = describeControllers(readGamepads());
      setControllers((previous) => JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
    };
    sync();
    const timer = setInterval(() => { if (!document.hidden) sync(); }, 1000);
    window.addEventListener('gamepadconnected', sync);
    window.addEventListener('gamepaddisconnected', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      clearInterval(timer);
      window.removeEventListener('gamepadconnected', sync);
      window.removeEventListener('gamepaddisconnected', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);
  return controllers;
}
