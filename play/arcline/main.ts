import '@fontsource/bebas-neue/400.css';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/800.css';
import '../bridge.css';
import { startGame } from '../bridge';

void startGame(async () => {
  await Promise.all([
    document.fonts.load('400 92px "Bebas Neue"'),
    document.fonts.load('800 18px "Manrope"'),
  ]);
  return import('../../GAMES/arcline-1/apps/client/src/main');
});
