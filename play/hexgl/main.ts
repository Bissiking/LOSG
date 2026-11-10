import '../../GAMES/HexGL/css/fonts.css';
import '../../GAMES/HexGL/css/multi.css';
import '../bridge.css';
import './style.css';
import { startGame } from '../bridge';
import { gameInputActive, installLegacyInputGate, pollLegacyGamepad } from '../legacy-input';
import { loadLegacyScripts } from '../legacy-scripts';
import { createShipInputReader } from './controls';
import { createHexRuntime, type HexGame } from './runtime';

interface Race extends HexGame {
  renderer: { setSize(width: number, height: number): void };
  width: number; height: number;
  manager: HexGame['manager'] & { setCurrent(scene: string): void; get(scene: string): { camera: { aspect: number; updateProjectionMatrix(): void } } };
  components: HexGame['components'] & { cameraChase?: { camera?: { aspect: number; updateProjectionMatrix(): void } } };
  load(options: { onLoad(): void; onError(name: string): void; onProgress(progress: { loaded: number; total: number }): void }): void;
  gameplay?: NonNullable<HexGame['gameplay']> & { hud?: unknown };
  hud?: unknown;
  init(): void; initGameplay(): void; initHUD(): void; initGameComposer(): void; restart(): void;
}
interface ShipPad {
  acceleration: number; lstickx: number; ltrigger: number; rtrigger: number; select: boolean;
}

const element = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const keyboard = new Set<string>();
const readShip = createShipInputReader();
let shipInput = readShip();
let race: Race | undefined;
let stage = 'step-1';
let quality = 1;
let hud = true;
let menuIndex = 0;

void startGame(async () => {
  installLegacyInputGate();
  await loadLegacyScripts('hexgl');
  const legacy = window as unknown as { bkcore: {
    Audio: { _ctx?: AudioContext };
    controllers: { GamepadController: unknown };
    hexgl: { HexGL: new (options: Record<string, unknown>) => Race };
  } };
  const runtime = createHexRuntime(() => legacy.bkcore.Audio._ctx, () => { keyboard.clear(); shipInput = readShip(); });
  // Replace the obsolete browser-specific controller adapter, keeping the ship physics.
  legacy.bkcore.controllers.GamepadController = class implements ShipPad {
    static isCompatible() { return true; }
    acceleration = 0; lstickx = 0; ltrigger = 0; rtrigger = 0; select = false;
    constructor(private readonly onInput: (controller: ShipPad) => void) {}
    updateAvailable() {
      this.acceleration = Number(shipInput.forward || keyboard.has('ArrowUp'));
      this.lstickx = shipInput.steering || Number(keyboard.has('ArrowRight')) - Number(keyboard.has('ArrowLeft'));
      this.ltrigger = Number(shipInput.leftBrake || keyboard.has('KeyQ') || keyboard.has('KeyA') || keyboard.has('ArrowDown'));
      this.rtrigger = Number(shipInput.rightBrake || keyboard.has('KeyD') || keyboard.has('KeyE') || keyboard.has('ArrowDown'));
      this.onInput(this);
      return true;
    }
  };
  const show = (next: string) => {
    for (const id of ['step-1', 'step-2', 'step-3', 'step-4', 'step-5', 'credits']) {
      element(id).hidden = id !== next;
      element(id).style.display = '';
    }
    stage = next;
    const target = element(next).querySelector<HTMLButtonElement>('button:not(:disabled)');
    target?.focus({ preventScroll: true });
  };
  const menuButtons = ['start', 's-quality', 's-hud', 's-credits'].map((id) => element<HTMLButtonElement>(id));
  element('start').onclick = () => show('step-2');
  element('s-quality').onclick = () => {
    quality = (quality + 1) % 4;
    element('s-quality').textContent = `Qualité : ${['basse', 'moyenne', 'haute', 'très haute'][quality]}`;
  };
  element('s-hud').onclick = () => { hud = !hud; element('s-hud').textContent = `Affichage : ${hud ? 'activé' : 'désactivé'}`; };
  element('s-credits').onclick = () => show('credits');
  element('close-credits').onclick = () => show('step-1');
  element('retry-load').onclick = () => window.location.reload();
  element('return-menu').onclick = () => window.location.reload();
  element('replay').onclick = () => { show('step-4'); race?.restart(); if (race) { race.active = true; runtime.attach(race); } };
  element('continue').onclick = () => {
    if (stage !== 'step-2') return;
    show('step-3');
    void legacy.bkcore.Audio._ctx?.resume().catch(() => {});
    try {
      race = new legacy.bkcore.hexgl.HexGL({ document, width: innerWidth, height: innerHeight,
        container: element('main'), overlay: element('overlay'), gameover: element('step-5'),
        quality, difficulty: 0, hud, controlType: 3, godmode: false, track: 'Cityscape' });
      race.load({
        onLoad() {
          try {
            race!.init(); race!.manager.setCurrent('game'); race!.initGameplay();
            show('step-4'); runtime.attach(race!);
          } catch (error) { fail(String(error)); }
        },
        onError: fail,
        onProgress({ loaded, total }) {
          element<HTMLProgressElement>('progressbar').value = total ? loaded / total * 100 : 0;
          element('loading-status').textContent = `Chargement du circuit : ${loaded} / ${total} ressources`;
        },
      });
    } catch (error) { fail(String(error)); }
  };
  function fail(name: string) {
    element('loading-status').textContent = `Le circuit n’a pas pu démarrer (${name}). Réessayez ou revenez à LOSG.`;
    element('retry-load').hidden = false;
    show('step-3');
  }
  // The legacy result screen changes display directly; translate that into our page state.
  const displayScore = (raceClass: { prototype: Record<string, unknown> }) => {
    const original = raceClass.prototype.displayScore as (this: Race, ...args: unknown[]) => void;
    raceClass.prototype.displayScore = function (this: Race, ...args: unknown[]) {
      original.apply(this, args); show('step-5');
    };
  };
  displayScore(legacy.bkcore.hexgl.HexGL as unknown as { prototype: Record<string, unknown> });
  window.addEventListener('keydown', (event) => {
    if (!gameInputActive() || stage !== 'step-4') return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyQ', 'KeyA', 'KeyD', 'KeyE'].includes(event.code)) {
      event.preventDefault(); keyboard.add(event.code);
    }
  });
  window.addEventListener('keyup', (event) => keyboard.delete(event.code));
  window.addEventListener('blur', () => { keyboard.clear(); runtime.input.keyboard.resetKeys(); });
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-key]')) {
    button.onpointerdown = (event) => { button.setPointerCapture(event.pointerId); keyboard.add(button.dataset.key!); };
    button.onpointerup = button.onpointercancel = () => { keyboard.delete(button.dataset.key!); };
  }
  pollLegacyGamepad((actions) => {
    for (const action of actions) {
      if (action === 'pause' && window.parent !== window) {
        window.parent.postMessage({ type: 'losg:menu' }, window.location.origin); continue;
      }
      if (stage === 'step-4' || stage === 'step-3') continue;
      const controls = stage === 'step-1' ? menuButtons : [...element(stage).querySelectorAll<HTMLButtonElement>('button:not([hidden])')];
      if (['up', 'down', 'left', 'right'].includes(action)) {
        const current = controls.indexOf(document.activeElement as HTMLButtonElement);
        const step = action === 'up' || action === 'left' ? -1 : 1;
        menuIndex = current < 0 ? 0 : (current + step + controls.length) % controls.length;
        controls[menuIndex]?.focus();
      } else if (action === 'accept') {
        const focused = document.activeElement as HTMLButtonElement;
        (controls.includes(focused) ? focused : controls[0])?.click();
      } else if (action === 'back' && (stage === 'credits' || stage === 'step-2')) show('step-1');
    }
  }, (pad) => {
    shipInput = readShip(pad);
    if (shipInput.restart && stage === 'step-4') race?.restart();
  });
  // Avoid creating a renderer when WebGL is unavailable.
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) element('start').textContent = 'WebGL indisponible sur ce navigateur';
  else { element<HTMLButtonElement>('start').disabled = false; element('start').textContent = 'Jouer'; }
  window.addEventListener('resize', () => {
    if (!race?.gameplay) return;
    race.width = innerWidth * (quality === 0 ? 0.5 : 1);
    race.height = innerHeight * (quality === 0 ? 0.5 : 1);
    race.renderer.setSize(race.width, race.height);
    for (const name of ['game', 'sky']) {
      const camera = race.manager.get(name).camera;
      camera.aspect = race.width / race.height; camera.updateProjectionMatrix();
    }
    race.initGameComposer();
    element('overlay').replaceChildren(); race.initHUD(); race.gameplay.hud = race.hud;
  });
  return { game: runtime };
});
