import type Phaser from 'phaser';
import { createPadActionReader, readGamepads, type PadAction } from '../src/lib/gamepad';

/** Native DOM activation keeps React handlers, disabled states and column previews intact. */
export function navigateDom(action: PadAction, root: ParentNode = document) {
  const controls = Array.from(root.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href]'))
    .filter((element) => element.getClientRects().length && !element.closest('[inert], [hidden]'));
  if (!controls.length) return;
  const active = document.activeElement as HTMLElement;
  let index = controls.indexOf(active);
  if (action === 'accept') {
    if (index < 0) controls[0].focus();
    else if (active instanceof HTMLSelectElement) {
      active.selectedIndex = (active.selectedIndex + 1) % active.options.length;
      active.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (active instanceof HTMLInputElement && ['number', 'range'].includes(active.type)) {
      active.stepUp(); active.dispatchEvent(new Event('input', { bubbles: true }));
    } else active.click();
  } else if (['left', 'right', 'up', 'down', 'previous', 'next'].includes(action)) {
    const step = ['left', 'up', 'previous'].includes(action) ? -1 : 1;
    index = index < 0 ? (step > 0 ? -1 : 0) : index;
    const next = controls[(index + step + controls.length) % controls.length];
    next.focus();
    next.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
}

type Control = Phaser.GameObjects.Container;
/** Traverse real Phaser controls; restrict focus to the foremost visible layer. */
export function installSceneGamepad(scene: Phaser.Scene, options: {
  onAction?: (action: PadAction) => boolean;
  navigation?: () => boolean;
} = {}) {
  let read = createPadActionReader();
  let focused: Control | undefined;
  const ring = scene.add.graphics().setDepth(10000).setScrollFactor(0);
  const collect = (objects: Phaser.GameObjects.GameObject[], depth = 0): { object: Control; depth: number }[] =>
    objects.flatMap((object) => {
      const container = object as Control;
      if (!container.visible || !container.active) return [];
      const effectiveDepth = depth + (container.depth ?? 0);
      const own = container.input?.enabled ? [{ object: container, depth: effectiveDepth }] : [];
      return container.list ? [...own, ...collect(container.list, effectiveDepth)] : own;
    });
  const update = (time: number) => {
    if (document.hidden || !document.hasFocus() || document.documentElement.dataset.losgPaused === 'true') {
      read = createPadActionReader(); ring.clear(); return;
    }
    const candidates = collect(scene.children.list);
    const depth = Math.max(...candidates.map((item) => item.depth));
    const controls = candidates.filter((item) => item.depth === depth).map((item) => item.object);
    if (!controls.includes(focused!)) focused = undefined;
    for (const { actions } of read(readGamepads(), time)) for (const action of actions) {
      if (options.onAction?.(action)) continue;
      if (options.navigation && !options.navigation()) continue;
      const index = focused ? controls.indexOf(focused) : -1;
      if (action === 'accept') {
        if (focused) focused.emit('pointerup');
        else focused = controls[0];
      } else if (['left', 'right', 'up', 'down'].includes(action)) {
        const step = action === 'left' || action === 'up' ? -1 : 1;
        focused = controls[(index < 0 ? 0 : index + step + controls.length) % controls.length];
      }
    }
    ring.clear();
    if (focused?.active && focused.scene && (!options.navigation || options.navigation())) {
      const bounds = focused.getBounds();
      const camera = scene.cameras.main;
      ring.lineStyle(3, 0x55e0f0, 1);
      ring.strokeRoundedRect(bounds.x - camera.scrollX - 5, bounds.y - camera.scrollY - 5, bounds.width + 10, bounds.height + 10, 8);
    }
  };
  scene.events.on('update', update);
  scene.events.once('shutdown', () => { scene.events.off('update', update); ring.destroy(); });
}
