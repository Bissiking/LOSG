import { describe, expect, it } from "vitest";
import { createMatchControllers } from "./local-input.js";

function pad(index: number, mapping = "standard", connected = true): Gamepad {
  return { index, mapping, connected } as Gamepad;
}

describe("local controller ownership", () => {
  it("shares one controller between both turns, including sparse browser ports", () => {
    const select = createMatchControllers("local");
    const pads = [pad(3)];
    expect(select(pads, "left")).toBe(pads[0]);
    expect(select(pads, "right")).toBe(pads[0]);
  });

  it("assigns two controllers by port and ignores unsupported or extra controllers", () => {
    const select = createMatchControllers("local");
    const first = pad(1), second = pad(4);
    const pads = [second, pad(0, ""), first, pad(6), pad(2, "standard", false)];
    expect(select(pads, "left")).toBe(first);
    expect(select(pads, "right")).toBe(second);
  });

  it("does not give the opponent's controller to a disconnected player", () => {
    const select = createMatchControllers("local");
    const first = pad(0), second = pad(2);
    select([first, second], "left");
    expect(select([second], "left")).toBeUndefined();
    expect(select([second], "right")).toBe(second);
    expect(select([first], "right")).toBeUndefined();
    expect(select([second, first], "left")).toBe(first);
    expect(select([second, first], "right")).toBe(second);
  });

  it("detects controllers connected after launch and switches to two assignments", () => {
    const select = createMatchControllers("local");
    const first = pad(3), second = pad(1);
    expect(select([], "left")).toBeUndefined();
    expect(select([first], "right")).toBe(first);
    expect(select([second, first], "left")).toBe(first);
    expect(select([second, first], "right")).toBe(second);
  });

  it("keeps the solo controller independent of the AI turn", () => {
    const select = createMatchControllers("solo");
    const first = pad(1), second = pad(2);
    expect(select([first, second], "left")).toBe(first);
    expect(select([first, second], "right")).toBe(first);
  });
});
