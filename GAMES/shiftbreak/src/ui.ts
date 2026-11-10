// GAMES/shiftbreak/src/ui.ts
import type { Level, World } from './engine/types';
import { sectionAt } from './levels/demo';
export type Screen = 'warning' | 'menu' | 'controls' | 'about' | 'playing' | 'paused' | 'dead' | 'won';
export const formatTime = (time: number) => `${Math.floor(time / 60).toString().padStart(2, '0')}:${(time % 60).toFixed(1).padStart(4, '0')}`;
const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9V3m0 0L3 7m4-4 4 4M17 15v6m0 0 4-4m-4 4-4-4"/></svg>';
export class UI {
  readonly canvas: HTMLCanvasElement;
  readonly panel: HTMLElement;
  readonly root: HTMLElement;
  readonly status: HTMLElement;
  screen: Screen = 'warning';
  private timer: HTMLElement;
  private speed: HTMLElement;
  private deaths: HTMLElement;
  private gravity: HTMLElement;
  private section: HTMLElement;
  private hint: HTMLElement;
  private progress: HTMLProgressElement;
  constructor(private onAction: (action: string) => void, private onKey: (key: string) => void) {
    this.root = document.querySelector('#shiftbreak')!;
    this.root.innerHTML = `
      <header class="sb-header"><span class="sb-wordmark">${arrow} SHIFTBREAK</span><span class="sb-version">0.1-PROTO</span><span class="sb-session">Session temporaire</span></header>
      <main class="sb-main">
        <div class="sb-hud" aria-label="Statistiques de la tentative">
          <div><span>Temps</span><strong id="sb-time">00:00.0</strong></div>
          <div><span>Vitesse</span><strong><b id="sb-speed">240</b> <small>px/s</small></strong></div>
          <div><span>Morts</span><strong id="sb-deaths">0</strong></div>
          <div class="sb-gravity" id="sb-gravity">Gravité : bas</div>
          <div class="sb-tools"><button data-action="pause" aria-label="Mettre en pause">Pause <kbd>P</kbd></button><button data-action="restart" aria-label="Recommencer le niveau">Recommencer <kbd>R</kbd></button></div>
        </div>
        <div class="sb-stage">
          <canvas tabindex="0" aria-label="Parcours SHIFTBREAK. Espace pour inverser la gravité, P pour mettre en pause."></canvas>
          <section class="sb-panel" aria-labelledby="sb-panel-title"></section>
          <p class="sb-status" role="status" aria-live="polite"></p>
        </div>
        <footer class="sb-footer"><div class="sb-lesson"><strong id="sb-section">Prendre le pli</strong><span id="sb-hint">Une pression. La gravité change de sens.</span></div><div class="sb-distance"><label for="sb-progress">Parcours unique</label><progress id="sb-progress" max="100" value="0">0 %</progress></div></footer>
      </main>
      <div class="sb-input-hint"><span><kbd class="sb-key-label">Espace</kbd> / A / Croix / toucher le jeu : inverser</span><span>Aucune sauvegarde</span></div>`;
    this.canvas = this.root.querySelector('canvas')!;
    this.panel = this.root.querySelector('.sb-panel')!;
    this.status = this.root.querySelector('.sb-status')!;
    this.timer = this.root.querySelector('#sb-time')!;
    this.speed = this.root.querySelector('#sb-speed')!;
    this.deaths = this.root.querySelector('#sb-deaths')!;
    this.gravity = this.root.querySelector('#sb-gravity')!;
    this.section = this.root.querySelector('#sb-section')!;
    this.hint = this.root.querySelector('#sb-hint')!;
    this.progress = this.root.querySelector('#sb-progress')!;
    this.root.addEventListener('click', (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]');
      if (button) this.onAction(button.dataset.action!);
    });
    this.root.addEventListener('change', (event) => {
      const select = event.target as HTMLSelectElement;
      if (select.id === 'sb-key') this.onKey(select.value);
    });
  }
  show(screen: Screen, world: World, key: string): void {
    this.screen = screen;
    this.root.dataset.screen = screen;
    this.panel.hidden = screen === 'playing';
    this.canvas.tabIndex = screen === 'playing' ? 0 : -1;
    for (const control of this.root.querySelectorAll<HTMLButtonElement>('.sb-tools button')) control.disabled = screen !== 'playing';
    if (screen === 'playing') { this.canvas.focus({ preventScroll: true }); return; }
    let content = '';
    const button = (action: string, text: string, primary = false) => `<button data-action="${action}" class="${primary ? 'sb-primary' : ''}">${text}</button>`;
    if (screen === 'warning') content = `
      <h1 id="sb-panel-title" class="sb-warning-title">SHIFTBREAK <span>0.1-PROTO</span></h1>
      <h2 class="sb-experimental">VERSION EXPÉRIMENTALE</h2>
      <p>Cette version est destinée à tester les mécaniques, la physique et les performances du jeu.</p>
      <ul><li>Aucune sauvegarde disponible.</li><li>Aucune progression conservée.</li><li>Les statistiques sont temporaires.</li><li>Certaines fonctionnalités peuvent être incomplètes ou instables.</li></ul>
      ${button('acknowledge', 'J’AI COMPRIS', true)}`;
    if (screen === 'menu') content = `
      <h1 id="sb-panel-title" class="sb-title">SHIFT<span>BREAK<span class="sb-title-dot">.</span></span></h1>
      <p class="sb-tagline">Changez de gravité.<br>Gardez le rythme.</p>
      <p>Un parcours. Une action. Jusqu’à l’autre bout.</p>
      <div class="sb-menu-actions">${button('play', 'Jouer', true)}${button('controls', 'Commandes')}${button('about', 'Informations sur le prototype')}</div>`;
    if (screen === 'controls') content = `
      <h1 id="sb-panel-title">Une pression suffit.</h1>
      <p>Vous avancez automatiquement. Inversez la gravité pour passer du sol au plafond, même en plein vol.</p>
      <label class="sb-select-label" for="sb-key">Touche d’inversion</label>
      <select id="sb-key"><option value="Space">Espace</option><option value="ArrowUp">Flèche haut</option><option value="KeyW">W</option><option value="KeyK">K</option></select>
      <dl class="sb-controls"><div><dt>Manette</dt><dd>A / Croix : inverser · Options / B : pause</dd></div><div><dt>Mobile / souris</dt><dd>Une pression sur le parcours : inverser</dd></div><div><dt>Clavier</dt><dd>P / Échap : pause · R : recommencer</dd></div></dl>
      <p>Blocs hachurés : danger. Rails pointillés : temporaires. Barrières pointillées : inactives.</p>${button('menu', 'Retour au menu')}`;
    if (screen === 'about') content = `<h1 id="sb-panel-title">Le premier passage.</h1><p>SHIFTBREAK 0.1-PROTO explore une idée : trouver son rythme en inversant la gravité.</p><p>Une seule carte d’environ 70 secondes : apprentissage, obstacles fixes et mobiles, plateformes temporaires, pièges synchronisés et une dernière combinaison.</p><p>Tout reste dans cette session. Fermer ou recharger le jeu efface les statistiques.</p>${button('menu', 'Retour au menu')}`;
    if (screen === 'paused') content = `<h1 id="sb-panel-title">Sur le fil.</h1><p>Le parcours est en pause.</p><div class="sb-menu-actions">${button('resume', 'Reprendre', true)}${button('restart', 'Recommencer')}${button('menu', 'Retour au menu')}</div>`;
    if (screen === 'dead') content = `<h1 id="sb-panel-title">On reprend.</h1><p>${world.deathReason}. La prochaine inversion sera la bonne.</p><p class="sb-result">${formatTime(world.time)} <span>· ${world.deaths} ${world.deaths > 1 ? 'morts' : 'mort'} dans cette session</span></p><div class="sb-menu-actions">${button('restart', 'Réessayer', true)}${button('menu', 'Retour au menu')}</div>`;
    if (screen === 'won') content = `<h1 id="sb-panel-title">Ligne franchie.</h1><p>Vous avez traversé SHIFTBREAK.</p><p class="sb-result">${formatTime(world.time)} <span>· ${world.flips} inversions<br>${world.deaths} ${world.deaths > 1 ? 'morts' : 'mort'} dans cette session</span></p><div class="sb-menu-actions">${button('restart', 'Rejouer le parcours', true)}${button('menu', 'Retour au menu')}</div>`;
    this.panel.innerHTML = content;
    const select = this.panel.querySelector('select');
    if (select) select.value = key;
    this.panel.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
    this.status.textContent = screen === 'dead' ? 'Collision. Réessayez.' : screen === 'won' ? 'Arrivée atteinte.' : '';
  }
  update(world: World, level: Level): void {
    this.timer.textContent = formatTime(world.time);
    this.speed.textContent = Math.round(world.speed).toString();
    this.deaths.textContent = world.deaths.toString();
    this.gravity.textContent = `Gravité : ${world.player.gravity === 1 ? 'bas' : 'haut'}`;
    this.gravity.dataset.direction = world.player.gravity === 1 ? 'down' : 'up';
    const section = sectionAt(level, world.player.x);
    if (this.section.textContent !== section.name) {
      this.section.textContent = section.name; this.hint.textContent = section.hint;
      if (world.phase === 'playing') this.status.textContent = section.name;
    }
    this.progress.value = Math.min(100, (world.player.x - level.spawn.x) / (level.length - level.spawn.x) * 100);
  }
  setKeyLabel(label: string): void {
    this.root.querySelector('.sb-key-label')!.textContent = label;
    this.canvas.setAttribute('aria-label', `Parcours SHIFTBREAK. ${label} pour inverser la gravité, P pour mettre en pause.`);
  }
}
