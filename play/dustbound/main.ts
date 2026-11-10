import '../bridge.css';
import { startGame } from '../bridge';

void startGame(() => import('../../GAMES/DustBound-main/src/main'));
