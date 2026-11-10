import '../bridge.css';
import { startGame } from '../bridge';

void startGame(() => import('../../GAMES/DustBound/src/main'));
