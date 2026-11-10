// Trajectoire dans le repère local du tireur, avant le miroir d'ArrowShot.
import { simulateTrajectory, type GameSide } from "@arcline/shared";
import { GROUND_Y, WORLD } from "./layout.js";

interface ShotTrajectoryInput {
  side: GameSide;
  originX: number;
  originY: number;
  angle: number;
  power: number;
  wind: number;
  gravity: number;
}

export function simulateShotTrajectory(input: ShotTrajectoryInput) {
  // ArrowShot mirrors local X for the right archer. Transform both the
  // world boundaries and wind into that same coordinate system.
  const mirrored = input.side === "right";
  return simulateTrajectory({
    angle: input.angle,
    power: input.power,
    wind: mirrored ? -input.wind : input.wind,
    gravity: input.gravity,
    groundBelow: GROUND_Y - input.originY,
    boundsX: mirrored
      ? { min: input.originX - WORLD.width, max: input.originX }
      : { min: -input.originX, max: WORLD.width - input.originX },
  });
}
