// play/shiftbreak/main.ts
import '../../GAMES/shiftbreak/src/style.css';
import '../bridge.css';
import { startGame } from '../bridge';
void startGame(() => import('../../GAMES/shiftbreak/src/main'));
