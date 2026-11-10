// src/game/InputController.ts
import Phaser from 'phaser';
import { driveInput, readGamepads, isSystemChord } from '../../../../src/lib/gamepad';

export interface DriveInput { throttle: number; tilt: number }

export class InputController {
  private readonly keys: Record<string, Phaser.Input.Keyboard.Key>;
  private mobileThrottle = 0;
  private mobileTilt = 0;
  private restartRequested = false;
  private restartHeld = true;

  constructor(scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard;
    if (!keyboard) throw new Error('Keyboard input unavailable');
    this.keys = keyboard.addKeys({
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      q: Phaser.Input.Keyboard.KeyCodes.Q,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      r: Phaser.Input.Keyboard.KeyCodes.R,
    }) as Record<string, Phaser.Input.Keyboard.Key>;
  }

  getState(): DriveInput {
    const pad = readGamepads().find((pad) => pad.mapping === 'standard');
    const drive = document.hasFocus() ? driveInput(pad) : { throttle: 0, tilt: 0 };
    const forward = this.keys.right.isDown || this.keys.d.isDown;
    const reverse = this.keys.left.isDown || this.keys.q.isDown || this.keys.a.isDown;
    const noseUp = this.keys.up.isDown;
    const noseDown = this.keys.down.isDown;
    return {
      throttle: Phaser.Math.Clamp((forward ? 1 : 0) - (reverse ? 1 : 0) + this.mobileThrottle + drive.throttle, -1, 1),
      tilt: Phaser.Math.Clamp((noseDown ? 1 : 0) - (noseUp ? 1 : 0) + this.mobileTilt + drive.tilt, -1, 1),
    };
  }

  setMobileThrottle(value: number): void { this.mobileThrottle = value; }
  setMobileTilt(value: number): void { this.mobileTilt = value; }
  requestRestart(): void { this.restartRequested = true; }

  consumeRestart(): boolean {
    const pad = readGamepads().find((pad) => pad.mapping === 'standard');
    const held = Boolean(pad && !isSystemChord(pad) && pad.buttons[2]?.pressed && document.hasFocus());
    const requested = this.restartRequested || Phaser.Input.Keyboard.JustDown(this.keys.r) || (held && !this.restartHeld);
    this.restartHeld = held;
    this.restartRequested = false;
    return requested;
  }
}
