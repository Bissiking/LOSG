import '../../GAMES/snake/src/style.css';
import '../bridge.css';
import { startGame } from '../bridge';

void startGame(() => import('../../GAMES/snake/src/main'));
