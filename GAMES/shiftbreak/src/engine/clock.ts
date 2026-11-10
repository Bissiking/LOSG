// GAMES/shiftbreak/src/engine/clock.ts
/** Retains substep remainder; no frame-dependent simulation delta. Hidden tabs are paused by the host. */
export class FixedClock {
  private accumulator = 0;
  constructor(readonly step: number) {}
  advance(seconds: number, tick: () => void): number {
    // Long stalls intentionally slow wall-clock time instead of teleporting the player.
    this.accumulator += Math.max(0, Math.min(seconds, 0.25));
    let count = 0;
    while (this.accumulator + 1e-10 >= this.step) {
      tick(); this.accumulator -= this.step; count++;
    }
    return count;
  }
  get alpha(): number { return Math.max(0, this.accumulator / this.step); }
  reset(): void { this.accumulator = 0; }
}
