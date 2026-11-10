import '../bridge.css';
import { startGame } from '../bridge';

void startGame(() => import('../../GAMES/Fouria-main/src/main'));
