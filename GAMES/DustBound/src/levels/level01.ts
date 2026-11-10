// src/levels/level01.ts
export interface TerrainPoint { x: number; y: number }
export interface PlatformData { id: string; x: number; y: number; width: number; angle?: number }
export interface LevelData {
  id: string;
  name: string;
  width: number;
  start: { x: number; y: number };
  finish: { x: number; y: number };
  terrain: TerrainPoint[];
  platforms: PlatformData[];
}

export const level01: LevelData = {
  id: 'level-01',
  name: 'La traversée nocturne',
  width: 11520,
  start: { x: 420, y: 500 },
  finish: { x: 10950, y: 400 },
  terrain: [
    { x: 0, y: 640 }, { x: 260, y: 630 }, { x: 520, y: 610 },
    { x: 760, y: 550 }, { x: 980, y: 470 }, { x: 1180, y: 520 },
    { x: 1380, y: 590 }, { x: 1580, y: 565 }, { x: 1770, y: 490 },
    { x: 1930, y: 410 }, { x: 2080, y: 450 }, { x: 2240, y: 570 },
    { x: 2460, y: 620 }, { x: 2680, y: 590 }, { x: 2860, y: 500 },
    { x: 3030, y: 430 }, { x: 3190, y: 470 }, { x: 3360, y: 600 },
    { x: 3560, y: 640 }, { x: 3780, y: 610 }, { x: 3970, y: 520 },
    { x: 4140, y: 390 }, { x: 4290, y: 360 }, { x: 4450, y: 460 },
    { x: 4640, y: 610 }, { x: 4880, y: 640 }, { x: 5120, y: 610 },
    { x: 5340, y: 530 }, { x: 5550, y: 470 }, { x: 5750, y: 500 },
    { x: 5940, y: 590 }, { x: 6160, y: 635 }, { x: 6400, y: 600 },
    { x: 6600, y: 520 }, { x: 6800, y: 430 }, { x: 6990, y: 380 },
    { x: 7170, y: 430 }, { x: 7360, y: 520 }, { x: 7540, y: 500 },
    { x: 7740, y: 440 }, { x: 7980, y: 430 }, { x: 8240, y: 445 },
    { x: 8500, y: 460 }, { x: 8700, y: 520 }, { x: 8900, y: 610 },
    { x: 9120, y: 640 }, { x: 9340, y: 570 }, { x: 9530, y: 460 },
    { x: 9690, y: 350 }, { x: 9840, y: 390 }, { x: 10030, y: 540 },
    { x: 10240, y: 620 }, { x: 10460, y: 580 }, { x: 10640, y: 470 },
    { x: 10840, y: 390 }, { x: 11040, y: 410 }, { x: 11300, y: 430 },
    { x: 11520, y: 450 },
  ],
  platforms: [
    { id: 'platform-01', x: 2570, y: 592, width: 180, angle: -0.14 },
    { id: 'platform-02', x: 2935, y: 456, width: 140, angle: -0.39 },
    { id: 'platform-03', x: 4770, y: 613, width: 200, angle: 0.12 },
    { id: 'platform-04', x: 5230, y: 557, width: 180, angle: -0.35 },
    { id: 'platform-05', x: 6050, y: 600, width: 180, angle: 0.2 },
    { id: 'platform-06', x: 8790, y: 548, width: 160, angle: 0.42 },
    { id: 'platform-07', x: 9230, y: 592, width: 180, angle: -0.31 },
    { id: 'platform-08', x: 10135, y: 567, width: 170, angle: 0.36 },
  ],
};
