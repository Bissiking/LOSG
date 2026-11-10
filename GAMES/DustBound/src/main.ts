// src/main.ts
import '@fontsource/bebas-neue';
import Phaser from 'phaser';
import { BootScene } from './game/BootScene';
import { EditorScene } from './game/EditorScene';
import { GameScene } from './game/GameScene';
import './style.css';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#061a27',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  physics: {
    default: 'matter',
    matter: {
      gravity: { x: 0, y: 1.28 },
      enableSleeping: false,
      positionIterations: 10,
      velocityIterations: 8,
      constraintIterations: 4,
    },
  },
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: false,
  },
  scene: [BootScene, GameScene, EditorScene],
};

export const game = new Phaser.Game(config);
