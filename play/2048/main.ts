import '../../GAMES/2048/style/main.css';
import '../bridge.css';
import './style.css';
import { startGame } from '../bridge';
import { installLegacyInputGate, pollLegacyGamepad } from '../legacy-input';
import { loadLegacyScripts } from '../legacy-scripts';

interface Game2048 {
  inputManager: { emit(event: string, value?: number): void };
  over: boolean;
  won: boolean;
  keepPlaying: boolean;
}

void startGame(async () => {
  installLegacyInputGate();
  await loadLegacyScripts('2048');
  // Classic scripts intentionally expose constructors on their isolated window.
  const legacy = window as unknown as {
    GameManager: new (...args: unknown[]) => Game2048;
    KeyboardInputManager: unknown;
    HTMLActuator: { new (): unknown; prototype: { message(won: boolean): void } };
    LocalStorageManager: { new (): { bestScoreKey: string; gameStateKey: string; getGameState(): unknown } };
  };
  class Storage extends legacy.LocalStorageManager {
    constructor() { super(); this.bestScoreKey = 'losg-2048-best'; this.gameStateKey = 'losg-2048-state'; }
    getGameState(): unknown {
      try { return super.getGameState(); } catch { return null; }
    }
  }
  const message = legacy.HTMLActuator.prototype.message;
  legacy.HTMLActuator.prototype.message = function (won) {
    message.call(this, won);
    document.querySelector('.game-message p')!.textContent = won ? 'Vous avez gagné !' : 'Partie terminée !';
  };
  const manager = new legacy.GameManager(4, legacy.KeyboardInputManager, legacy.HTMLActuator, Storage);
  const directions: Record<string, number> = { up: 0, right: 1, down: 2, left: 3 };
  pollLegacyGamepad((actions) => {
    for (const action of actions) {
      if (action in directions) manager.inputManager.emit('move', directions[action]);
      else if (action === 'previous') manager.inputManager.emit('restart');
      else if (action === 'accept') {
        if (manager.over) manager.inputManager.emit('restart');
        else if (manager.won && !manager.keepPlaying) manager.inputManager.emit('keepPlaying');
      } else if (action === 'pause' && window.parent !== window) {
        window.parent.postMessage({ type: 'losg:menu' }, window.location.origin);
      }
    }
  });
  // No autonomous simulation: the capture gate freezes all moves while LOSG is open.
  return undefined;
});
