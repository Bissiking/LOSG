import { createPadActionReader, readGamepads } from "../../../../src/lib/gamepad";
// src/game/InputManager.ts

export enum Action {
  UP = "UP",
  DOWN = "DOWN",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
  CONFIRM = "CONFIRM",
  BACK = "BACK",
  PAUSE = "PAUSE",
}

export type KeyMapping = "AZERTY" | "QWERTY";

const GAME_KEYS = [
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Enter",
  "Escape",
  "w",
  "a",
  "s",
  "d",
  "W",
  "A",
  "S",
  "D",
  "z",
  "q",
  "Z",
  "Q",
];

export class InputManager {
  private keyMapping: KeyMapping;
  private keysJustPressed = new Set<string>();
  private keysHeld = new Set<string>();
  private directionQueue: Action[] = [];
  private confirmPressed = false;
  private backPressed = false;
  private pausePressed = false;
  private readPad = createPadActionReader(false);
  private listeners = new AbortController();

  constructor(keyMapping: KeyMapping = "AZERTY") {
    this.keyMapping = keyMapping;
    this.setupListeners();
  }

  private setupListeners(): void {
    const clearHeld = () => {
      this.keysHeld.clear(); this.keysJustPressed.clear(); this.clearQueue();
      this.readPad = createPadActionReader(false);
    };
    window.addEventListener('blur', clearHeld, { signal: this.listeners.signal });
    window.addEventListener('losg:pause-change', clearHeld, { signal: this.listeners.signal });
    window.addEventListener("keydown", (e) => {
      if (!this.keysHeld.has(e.key)) {
        this.keysJustPressed.add(e.key);
      }
      this.keysHeld.add(e.key);
      if (GAME_KEYS.includes(e.key)) {
        e.preventDefault();
      }
    }, { signal: this.listeners.signal });

    window.addEventListener("keyup", (e) => {
      this.keysHeld.delete(e.key);
    }, { signal: this.listeners.signal });
  }

  setKeyMapping(mapping: KeyMapping): void {
    this.keyMapping = mapping;
  }

  private mapKeyToDirection(key: string): Action | null {
    if (key === "ArrowUp") return Action.UP;
    if (key === "ArrowDown") return Action.DOWN;
    if (key === "ArrowLeft") return Action.LEFT;
    if (key === "ArrowRight") return Action.RIGHT;

    const k = key.toLowerCase();

    if (this.keyMapping === "AZERTY") {
      if (k === "z") return Action.UP;
      if (k === "s") return Action.DOWN;
      if (k === "q") return Action.LEFT;
      if (k === "d") return Action.RIGHT;
    } else {
      if (k === "w") return Action.UP;
      if (k === "s") return Action.DOWN;
      if (k === "a") return Action.LEFT;
      if (k === "d") return Action.RIGHT;
    }

    return null;
  }

  destroy(): void { this.listeners.abort(); this.clearQueue(); }

  update(): void {
    if (document.hidden || !document.hasFocus() || document.documentElement.dataset.losgPaused === 'true') {
      this.clearQueue(); this.readPad = createPadActionReader(false); return;
    }
    for (const key of this.keysJustPressed) {
      const direction = this.mapKeyToDirection(key);
      if (direction) {
        this.directionQueue.push(direction);
        if (this.directionQueue.length > 3) {
          this.directionQueue.shift();
        }
      }
      if (key === "Enter") this.confirmPressed = true;
      if (key === "Escape") this.backPressed = true;
    }
    this.keysJustPressed.clear();

    this.pollGamepad();
  }

  private pollGamepad(): void {
    const pad = readGamepads().find((pad) => pad.mapping === 'standard');
    const directions = { up: Action.UP, down: Action.DOWN, left: Action.LEFT, right: Action.RIGHT };
    for (const { actions } of this.readPad(pad ? [pad] : [], performance.now())) {
      for (const action of actions) {
        if (action in directions) this.directionQueue.push(directions[action as keyof typeof directions]);
        if (action === 'accept') this.confirmPressed = true;
        if (action === 'back') this.backPressed = true;
      }
    }
    if (this.directionQueue.length > 3) this.directionQueue.splice(0, this.directionQueue.length - 3);
  }

  consumeDirection(): Action | null {
    return this.directionQueue.shift() ?? null;
  }

  consumeConfirm(): boolean {
    const pressed = this.confirmPressed;
    this.confirmPressed = false;
    return pressed;
  }

  consumeBack(): boolean {
    const pressed = this.backPressed;
    this.backPressed = false;
    return pressed;
  }

  consumePause(): boolean {
    const pressed = this.pausePressed;
    this.pausePressed = false;
    return pressed;
  }

  clearQueue(): void {
    this.directionQueue = [];
    this.confirmPressed = false;
    this.backPressed = false;
    this.pausePressed = false;
  }
}
