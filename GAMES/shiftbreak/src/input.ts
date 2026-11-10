// GAMES/shiftbreak/src/input.ts
import { createPadActionReader, readGamepads, type PadAction } from '../../../src/lib/gamepad';
import { navigateDom } from '../../../play/gamepad';
export type Command = 'flip' | 'pause' | 'restart';
export class Input {
  key = 'Space';
  private read = createPadActionReader(false);
  private held = new Set<string>();
  private pointers = new Set<number>();
  private abort = new AbortController();
  constructor(canvas: HTMLCanvasElement, private send: (command: Command) => void, private playing: () => boolean) {
    const options = { signal: this.abort.signal };
    window.addEventListener('keydown', (event) => {
      if (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.target instanceof HTMLElement && event.target.closest('select, input, textarea')) return;
      const command = event.code === this.key ? 'flip' : ['Escape', 'KeyP'].includes(event.code)
        ? 'pause' : event.code === 'KeyR' ? 'restart' : null;
      if (!command || (command === 'flip' && !this.playing())) return;
      event.preventDefault();
      if (!event.repeat && !this.held.has(event.code)) this.send(command);
      this.held.add(event.code);
    }, options);
    window.addEventListener('keyup', (event) => this.held.delete(event.code), options);
    canvas.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      const first = this.pointers.size === 0;
      this.pointers.add(event.pointerId);
      if (!first || !event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
      canvas.focus({ preventScroll: true });
      if (this.playing()) this.send('flip');
    }, options);
    const release = (event: PointerEvent) => this.pointers.delete(event.pointerId);
    window.addEventListener('pointerup', release, options);
    window.addEventListener('pointercancel', release, options);
    window.addEventListener('blur', () => { this.held.clear(); this.reset(); }, options);
  }
  poll(time: number, blocked: boolean, menu: ParentNode): void {
    if (blocked) { this.read = createPadActionReader(false); return; }
    // One solo player; other devices cannot generate a duplicate action in the same frame.
    const pad = readGamepads().filter((pad) => pad.mapping === 'standard').sort((a, b) => a.index - b.index)[0];
    for (const { actions } of this.read(pad ? [pad] : [], time)) {
      for (const action of actions) this.pad(action, menu);
    }
  }
  private pad(action: PadAction, menu: ParentNode): void {
    if (this.playing()) {
      if (action === 'accept') this.send('flip');
      if (action === 'pause' || action === 'back') this.send('pause');
    } else if (action === 'pause' || action === 'back') this.send('pause');
    else navigateDom(action, menu);
  }
  reset(): void {
    // Retain held keyboard codes until keyup: resuming while Space is held must not flip.
    this.pointers.clear(); this.read = createPadActionReader(false);
  }
  destroy(): void { this.abort.abort(); }
}
