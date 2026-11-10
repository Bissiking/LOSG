import '../../GAMES/snake-main/src/style.css';
import '../bridge.css';
import { startGame } from '../bridge';

void startGame(() => import('../../GAMES/snake-main/src/main'));
