import type { GameSide } from "@arcline/shared";

export type MatchMode = "solo" | "local";

/** Keep controller ports assigned for the whole match, including disconnections. */
export function createMatchControllers(mode: MatchMode) {
  const slots: number[] = [];
  return (pads: readonly Gamepad[], side: GameSide): Gamepad | undefined => {
    const connected = pads
      .filter((pad) => pad.connected && pad.mapping === "standard")
      .sort((a, b) => a.index - b.index);
    for (const pad of connected) {
      if (slots.length >= (mode === "local" ? 2 : 1)) break;
      if (!slots.includes(pad.index)) slots.push(pad.index);
    }
    const slot = mode === "local" && slots.length > 1 && side === "right" ? 1 : 0;
    return connected.find((pad) => pad.index === slots[slot]);
  };
}
