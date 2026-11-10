import '../bridge.css';
import { startGame } from '../bridge';

void startGame(() => import('../../GAMES/Fouria/src/main'));
