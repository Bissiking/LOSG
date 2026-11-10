import { describe, expect, it } from "vitest";
import { chooseBotShot, reachableGravity } from "@arcline/shared";
import { GROUND_Y, PLAYER_FEET_X, WORLD } from "./layout.js";
import { simulateShotTrajectory } from "./trajectory.js";

const originY = GROUND_Y - 62;

describe("world-space shot trajectories", () => {
  it.each([1100, 1880, 2500])("lets the AI at x=%i fly to the ground rather than hit an invisible wall", (originX) => {
    const distance = originX - PLAYER_FEET_X.left;
    const gravity = Math.min(860, reachableGravity(distance));
    const shot = chooseBotShot(distance, () => 0.5, gravity);
    const points = simulateShotTrajectory({ side: "right", originX, originY, ...shot, wind: 9, gravity });
    const last = points.at(-1)!;
    expect(originY + last.y).toBeGreaterThanOrEqual(GROUND_Y);
    expect(last.x).toBeGreaterThan(distance * 0.95);
    // Distant archers used to hit the boundary behind them, mirrored ahead.
    if (distance > WORLD.width - originX) {
      expect(last.x).toBeGreaterThan(WORLD.width - originX);
    }
    expect(originX - last.x).toBeGreaterThan(0);
  });

  it("mirrors the whole flight for mirrored shooters when there is no wind", () => {
    const input = { originY, angle: 45, power: 85, wind: 0, gravity: 860 };
    const left = simulateShotTrajectory({ ...input, side: "left", originX: 190 });
    const right = simulateShotTrajectory({ ...input, side: "right", originX: WORLD.width - 190 });
    expect(right).toEqual(left);
  });

  it.each(["left", "right"] as const)("a wind to the right moves a %s shooter's arrow to the right in world space", (side) => {
    const originX = side === "left" ? 190 : 2370;
    const input = { side, originX, originY, angle: 45, power: 60, gravity: 700 };
    const calm = simulateShotTrajectory({ ...input, wind: 0 });
    const windy = simulateShotTrajectory({ ...input, wind: 10 });
    const worldX = (x: number) => originX + (side === "right" ? -x : x);
    expect(worldX(windy[60]!.x)).toBeGreaterThan(worldX(calm[60]!.x));
  });

  it.each(["left", "right"] as const)("keeps the %s shooter's flight bounded by the actual world edges", (side) => {
    const originX = side === "left" ? 190 : 2370;
    const points = simulateShotTrajectory({ side, originX, originY, angle: 20, power: 100, wind: 0, gravity: 100 });
    const last = points.at(-1)!;
    const worldX = originX + (side === "right" ? -last.x : last.x);
    expect(side === "left" ? worldX >= WORLD.width : worldX <= 0).toBe(true);
    expect(originY + last.y).toBeLessThan(GROUND_Y);
    for (const point of points.slice(0, -1)) {
      const x = originX + (side === "right" ? -point.x : point.x);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(WORLD.width);
    }
  });
});
