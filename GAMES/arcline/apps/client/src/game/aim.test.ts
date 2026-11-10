import type Phaser from "phaser";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AimController } from "./aim.js";
import { createMatchControllers } from "./local-input.js";

vi.mock("phaser", () => ({ default: {
  Math: { Clamp: (value: number, min: number, max: number) => Math.max(min, Math.min(max, value)) },
  Display: { Color: { HexStringToColor: () => ({ color: 0 }) } },
} }));

function setup() {
  const graphics = Object.fromEntries(["setDepth", "clear", "lineStyle", "lineBetween", "fillStyle", "fillTriangle"]
    .map((name) => [name, vi.fn().mockReturnThis()]));
  const text = Object.fromEntries(["setOrigin", "setVisible", "setDepth", "setText", "setPosition", "destroy"]
    .map((name) => [name, vi.fn().mockReturnThis()]));
  const listeners = new Map<string, (...args: unknown[]) => void>();
  const scene = {
    add: { graphics: () => graphics, text: () => text },
    input: {
      on: (event: string, callback: (...args: unknown[]) => void, context: unknown) => listeners.set(event, callback.bind(context)),
      off: (event: string) => listeners.delete(event),
    },
  } as unknown as Phaser.Scene;
  const pads = [0, 2].map((index) => ({
    index, id: `Controller ${index}`, connected: true, mapping: "standard", axes: [0, 0],
    buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })),
  } as Gamepad));
  const document = { hidden: false, hasFocus: () => true, documentElement: { dataset: { losgPaused: "false" } } };
  vi.stubGlobal("navigator", { getGamepads: () => pads });
  vi.stubGlobal("document", document);
  const select = createMatchControllers("local");
  let side: "left" | "right" = "left";
  const onShot = vi.fn();
  const aim = new AimController(scene, { originX: 190, originY: 578, getController: (pads) => select(pads, side), onShot });
  const press = (index: number, pressed: boolean) => {
    pads[index].buttons[0].pressed = pressed;
    aim.updateGamepad(16);
  };
  return { aim, pads, document, onShot, graphics, press, listeners,
    turnRight: () => { side = "right"; aim.setTurn("right", 1800); aim.setEnabled(true); },
  };
}

afterEach(() => vi.unstubAllGlobals());

describe("aim input lifecycle", () => {
  it("accepts only the active controller and locks immediately after one shot", () => {
    const { aim, press, onShot } = setup();
    aim.updateGamepad(16);
    press(1, true);
    expect(onShot).not.toHaveBeenCalled();
    press(0, true);
    expect(onShot).toHaveBeenCalledExactlyOnceWith(45, 70);
    press(0, false);
    press(0, true);
    expect(onShot).toHaveBeenCalledTimes(1);
  });

  it("requires a held button to be released on the next player's turn", () => {
    const { aim, press, onShot, turnRight } = setup();
    press(1, true);
    turnRight();
    aim.updateGamepad(16);
    expect(onShot).not.toHaveBeenCalled();
    press(1, false);
    press(1, true);
    expect(onShot).toHaveBeenCalledExactlyOnceWith(45, 70);
  });

  it("mirrors the second player's gamepad preview and fires from that side", () => {
    const { aim, pads, onShot, graphics, turnRight, press } = setup();
    turnRight();
    aim.updateGamepad(16);
    pads[1].axes[1] = -1;
    aim.updateGamepad(16);
    const [x, y, endX, endY] = graphics.lineBetween.mock.calls.at(-1)!;
    expect(x).toBe(1800);
    expect(endX).toBeLessThan(x);
    expect(endY).toBeLessThan(y);
    pads[1].axes[1] = 0;
    press(1, true);
    expect(onShot.mock.calls[0][0]).toBeGreaterThan(45);
  });

  it("shoots leftward with the mouse and ignores presses over UI controls", () => {
    const { turnRight, listeners, onShot } = setup();
    turnRight();
    const down = { worldX: 1700, worldY: 578, leftButtonDown: () => true };
    const up = { worldX: 1575, worldY: 453 };
    listeners.get("pointerdown")!(down, [{ input: { enabled: true } }]);
    listeners.get("pointerup")!(up);
    expect(onShot).not.toHaveBeenCalled();
    listeners.get("pointerdown")!(down, []);
    listeners.get("pointerup")!(up);
    expect(onShot.mock.calls[0][0]).toBeCloseTo(45);
    expect(onShot.mock.calls[0][1]).toBeCloseTo(Math.SQRT2 * 50);
    listeners.get("pointerdown")!(down, []);
    listeners.get("pointerup")!(up);
    expect(onShot).toHaveBeenCalledTimes(1);
  });

  it("suppresses held accept after focus loss or the LOSG overlay", () => {
    const { aim, press, onShot, document } = setup();
    aim.updateGamepad(16);
    document.documentElement.dataset.losgPaused = "true";
    press(0, true);
    document.documentElement.dataset.losgPaused = "false";
    aim.updateGamepad(16);
    expect(onShot).not.toHaveBeenCalled();
    press(0, false);
    document.hidden = true;
    press(0, true);
    document.hidden = false;
    aim.updateGamepad(16);
    expect(onShot).not.toHaveBeenCalled();
    press(0, false);
    press(0, true);
    expect(onShot).toHaveBeenCalledTimes(1);
  });
});
