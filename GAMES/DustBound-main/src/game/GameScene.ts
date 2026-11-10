// src/game/GameScene.ts
import Phaser from 'phaser';
import type { LevelData } from '../levels/level01';
import { CameraController } from './CameraController';
import { InputController } from './InputController';
import { LevelManager } from './LevelManager';
import { getActiveLevel } from './LevelStore';
import { MobileControls } from './MobileControls';
import { Terrain } from './Terrain';
import { Vehicle } from './Vehicle';

export class GameScene extends Phaser.Scene {
  private vehicle!: Vehicle;
  private levelData!: LevelData;
  private inputController!: InputController;
  private mobileControls!: MobileControls;
  private cameraController!: CameraController;
  private levelManager!: LevelManager;
  private timerElement!: HTMLElement;
  private progressElement!: HTMLElement;
  private markerElement!: HTMLElement;
  private checkpointElement!: HTMLElement;
  private speedGaugeElement!: HTMLElement;
  private speedValueElement!: HTMLElement;
  private speedArcElement!: SVGPathElement;
  private messageElement!: HTMLElement;
  private restartButton!: HTMLButtonElement;
  private editorButton!: HTMLButtonElement;
  private respawning = false;

  constructor() { super('GameScene'); }

  create(): void {
    this.levelData = getActiveLevel();
    document.body.classList.remove('is-editing');
    document.querySelector<HTMLElement>('#hud')!.hidden = false;
    this.matter.world.setBounds(0, -240, this.levelData.width + 120, 1240, 100, true, true, false, true);
    new Terrain(this, this.levelData);
    this.vehicle = new Vehicle(this, this.levelData.start.x, this.levelData.start.y);
    this.inputController = new InputController(this);
    this.mobileControls = new MobileControls(this.inputController);
    this.cameraController = new CameraController(this, this.vehicle, this.levelData.width);
    this.levelManager = new LevelManager(this, this.levelData, this.vehicle, (elapsed) => this.handleFinish(elapsed));
    this.bindInterface();
    this.cameraController.snap();
    const help = window.matchMedia('(pointer: coarse)').matches
      ? 'Utilisez les quatre commandes tactiles'
      : '→ / D accélérer · ← / Q / A reculer · ↑ ↓ incliner';
    this.showMessage('PRÊT ?', help, 2600);

    this.scale.on('resize', this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.handleResize, this);
      this.restartButton.removeEventListener('click', this.handleRestartClick);
      this.editorButton.removeEventListener('click', this.handleEditorClick);
      this.mobileControls.destroy();
    });
  }

  update(): void {
    const input = this.inputController.getState();
    if (!this.levelManager.hasStarted && (input.throttle !== 0 || input.tilt !== 0)) {
      this.levelManager.start();
      this.hideMessage();
    }
    if (this.inputController.consumeRestart()) this.restartRace();

    this.vehicle.update(input, !this.respawning && !this.levelManager.isFinished);
    if (!this.respawning && !this.levelManager.isFinished && this.vehicle.shouldRespawn()) this.respawnVehicle();
    this.cameraController.update();
    this.updateHud();
  }

  private bindInterface(): void {
    this.timerElement = this.requireElement('#timer-value');
    this.progressElement = this.requireElement('#route-progress');
    this.markerElement = this.requireElement('#route-marker');
    this.checkpointElement = this.requireElement('#checkpoint-label');
    this.speedGaugeElement = this.requireElement('#speed-gauge');
    this.speedValueElement = this.requireElement('#speed-value');
    this.speedArcElement = this.requireElement<SVGPathElement>('#speed-arc');
    this.messageElement = this.requireElement('#status-message');
    this.restartButton = this.requireElement<HTMLButtonElement>('#restart-button');
    this.editorButton = this.requireElement<HTMLButtonElement>('#editor-button');
    this.restartButton.addEventListener('click', this.handleRestartClick);
    this.editorButton.addEventListener('click', this.handleEditorClick);
  }

  private readonly handleRestartClick = (): void => { this.inputController.requestRestart(); };
  private readonly handleEditorClick = (): void => { this.scene.start('EditorScene'); };

  private updateHud(): void {
    const progress = this.levelManager.getProgress(this.vehicle.x);
    this.timerElement.textContent = this.formatTime(this.levelManager.getElapsed());
    this.progressElement.style.width = `${progress * 100}%`;
    this.markerElement.style.left = `${progress * 100}%`;
    const speed = Math.round(this.vehicle.speedKmh);
    const speedRatio = Phaser.Math.Clamp(speed / 160, 0, 1);
    this.speedValueElement.textContent = speed.toString().padStart(3, '0');
    this.speedArcElement.style.strokeDasharray = `${speedRatio * 100} 100`;
    this.speedGaugeElement.setAttribute('aria-label', `Vitesse : ${speed} kilomètres par heure`);
    if (this.levelManager.isFinished) this.checkpointElement.textContent = 'ARRIVÉE';
    else if (this.levelManager.hasStarted) this.checkpointElement.textContent = `${Math.round(progress * 100)} % DU PARCOURS`;
    else this.checkpointElement.textContent = 'DÉPART';
  }

  private restartRace(): void {
    this.respawning = false;
    this.levelManager.reset();
    this.vehicle.respawn(this.levelData.start.x, this.levelData.start.y);
    this.cameraController.snap();
    this.showMessage('NOUVEAU RUN', 'Accélérez quand vous êtes prêt', 1100);
  }

  private respawnVehicle(): void {
    this.respawning = true;
    this.cameras.main.shake(130, 0.006);
    this.showMessage('REMISE SUR ROUES', 'Retour au checkpoint', 850);
    this.time.delayedCall(360, () => {
      this.vehicle.respawn(this.levelData.start.x, this.levelData.start.y);
      this.cameraController.snap();
      this.respawning = false;
    });
  }

  private handleFinish(elapsed: number): void {
    this.showMessage('ARRIVÉE !', `${this.formatTime(elapsed)} · Utilisez Restart pour rejouer`, 0);
    this.cameras.main.flash(220, 40, 215, 221, false);
  }

  private showMessage(title: string, detail: string, duration: number): void {
    this.messageElement.innerHTML = `${title}<small>${detail}</small>`;
    this.messageElement.classList.add('is-visible');
    if (duration > 0) this.time.delayedCall(duration, () => this.hideMessage());
  }

  private hideMessage(): void { this.messageElement.classList.remove('is-visible'); }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    this.cameraController.resize(gameSize.width, gameSize.height);
  }

  private formatTime(milliseconds: number): string {
    const totalCentiseconds = Math.floor(milliseconds / 10);
    const minutes = Math.floor(totalCentiseconds / 6000);
    const seconds = Math.floor((totalCentiseconds % 6000) / 100);
    const centiseconds = totalCentiseconds % 100;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  }

  private requireElement<T extends Element = HTMLElement>(selector: string): T {
    const element = document.querySelector<T>(selector);
    if (!element) throw new Error(`Missing interface element: ${selector}`);
    return element;
  }
}
