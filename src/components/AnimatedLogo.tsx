// src/components/AnimatedLogo.tsx
import { useEffect, useRef, useState } from 'react';

/** Decorative LUMA mark; its loop runs only while the settings logo is visible. */
export function AnimatedLogo({ animated }: { animated: boolean }) {
  const element = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!animated || !element.current) return;
    let inView = typeof IntersectionObserver === 'undefined';
    const update = () => setVisible(inView && !document.hidden);
    const observer = typeof IntersectionObserver === 'undefined' ? undefined : new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });
    observer?.observe(element.current);
    document.addEventListener('visibilitychange', update);
    update();
    return () => {
      observer?.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, [animated]);

  return <span ref={element} className={`brand-mark settings-logo ${animated && visible ? 'is-animating' : ''}`} aria-hidden="true">
    <span /><span /><span />
  </span>;
}
