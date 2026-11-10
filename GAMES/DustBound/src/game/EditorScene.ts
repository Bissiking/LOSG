// src/game/EditorScene.ts
import Phaser from 'phaser';
import type { LevelData } from '../levels/level01';
import { LevelEditor, type EditorSelection } from './LevelEditor';
import { getActiveLevel, resetActiveLevel, saveActiveLevel } from './LevelStore';

export class EditorScene extends Phaser.Scene {
  private levelData!: LevelData;
  private editor!: LevelEditor;
  private terrainGraphics!: Phaser.GameObjects.Graphics;
  private handles: Phaser.GameObjects.Shape[] = [];
  private selection: EditorSelection = null;
  private history: LevelData[] = [];
  private cursorKeys!: Phaser.Types.Input.Keyboard.CursorKeys;
  private savedSnapshot = '';
  private startLabel!: Phaser.GameObjects.Text;
  private finishLabel!: Phaser.GameObjects.Text;

  constructor() { super('EditorScene'); }

  create(): void {
    this.levelData = getActiveLevel();
    this.savedSnapshot = JSON.stringify(this.levelData);
    const editorZoom = this.scale.height < 500 ? 0.55 : 0.7;
    this.cameras.main.setBackgroundColor('#061a27').setBounds(0, -100, this.levelData.width, 1050).setZoom(editorZoom);
    this.drawGrid();
    this.terrainGraphics = this.add.graphics().setDepth(0);
    this.redrawTerrain();
    this.rebuildHandles();
    this.cursorKeys = this.input.keyboard!.createCursorKeys();
    this.bindCanvasEditing();
    this.editor = new LevelEditor({
      onChange: (property, value) => this.changeSelection(property, value),
      onAddPlatform: () => this.addPlatform(),
      onDelete: () => this.deleteSelection(),
      onUndo: () => this.undo(),
      onSave: () => this.save(),
      onTest: () => this.testLevel(),
      onExit: () => this.exitEditor(),
      onReset: () => this.reset(),
      onImport: (level) => this.importLevel(level),
      onPan: (direction) => this.pan(direction),
      getLevel: () => structuredClone(this.levelData),
    });
    this.editor.show();
    this.editor.setUndoAvailable(false);
    this.editor.setDirty(false);
    this.setGameInterfaceVisible(false);
    document.body.classList.add('is-editing');
    this.panTo(this.levelData.start.x);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.editor.destroy();
      this.input.removeAllListeners();
    });
  }

  update(): void {
    const speed = 18 / this.cameras.main.zoom;
    if (this.cursorKeys.left.isDown) this.cameras.main.scrollX -= speed;
    if (this.cursorKeys.right.isDown) this.cameras.main.scrollX += speed;
    this.clampCamera();
  }

  private bindCanvasEditing(): void {
    this.input.on('dragstart', (_pointer: Phaser.Input.Pointer, object: Phaser.GameObjects.Shape) => {
      this.pushHistory();
      this.select(object.getData('selection') as Exclude<EditorSelection, null>);
    });
    this.input.on('drag', (_pointer: Phaser.Input.Pointer, object: Phaser.GameObjects.Shape, dragX: number, dragY: number) => {
      const selection = object.getData('selection') as Exclude<EditorSelection, null>;
      this.moveSelection(selection, dragX, dragY);
      object.setPosition(this.getSelected(selection).x, this.getSelected(selection).y);
      this.updateMarkerLabels();
      this.redrawTerrain();
      this.editor.refresh(this.levelData);
      this.refreshDirtyState();
    });
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _objects: Phaser.GameObjects.GameObject[], deltaX: number, deltaY: number) => {
      this.cameras.main.scrollX += (Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY) * 1.8;
      this.clampCamera();
    });
    this.input.keyboard?.on('keydown-Z', (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) this.undo();
    });
    this.input.keyboard?.on('keydown-ESC', () => this.exitEditor());
  }

  private drawGrid(): void {
    const grid = this.add.graphics().setDepth(-3);
    grid.lineStyle(1, 0x28d7dd, 0.08);
    for (let x = 0; x <= this.levelData.width; x += 200) grid.strokeLineShape(new Phaser.Geom.Line(x, 120, x, 780));
    for (let y = 180; y <= 780; y += 100) grid.strokeLineShape(new Phaser.Geom.Line(0, y, this.levelData.width, y));
  }

  private redrawTerrain(): void {
    const points = this.levelData.terrain;
    this.terrainGraphics.clear();
    this.terrainGraphics.fillStyle(0x9f542e, 0.88).beginPath().moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => this.terrainGraphics.lineTo(point.x, point.y));
    this.terrainGraphics.lineTo(this.levelData.width, 880).lineTo(0, 880).closePath().fillPath();
    this.terrainGraphics.lineStyle(7, 0xd68945).beginPath().moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => this.terrainGraphics.lineTo(point.x, point.y));
    this.terrainGraphics.strokePath();

    this.levelData.platforms.forEach((platform) => {
      const selected = this.selection?.kind === 'platform' && this.selection.index === this.levelData.platforms.indexOf(platform);
      const cos = Math.cos(platform.angle ?? 0);
      const sin = Math.sin(platform.angle ?? 0);
      const half = platform.width / 2;
      this.terrainGraphics.lineStyle(selected ? 10 : 7, selected ? 0xed674b : 0x28d7dd, 1)
        .strokeLineShape(new Phaser.Geom.Line(platform.x - cos * half, platform.y - sin * half, platform.x + cos * half, platform.y + sin * half));
    });
  }

  private rebuildHandles(): void {
    this.handles.forEach((handle) => handle.destroy());
    this.handles = [];
    this.startLabel?.destroy();
    this.finishLabel?.destroy();
    this.levelData.terrain.forEach((point, index) => {
      const handle = this.add.circle(point.x, point.y, 13, 0x061a27).setStrokeStyle(5, 0xf5e4bd).setDepth(3);
      this.prepareHandle(handle, { kind: 'terrain', index });
    });
    this.levelData.platforms.forEach((platform, index) => {
      const handle = this.add.rectangle(platform.x, platform.y, platform.width, 34, 0x102f3d, 0.7)
        .setRotation(platform.angle ?? 0).setStrokeStyle(3, 0x28d7dd).setDepth(2);
      this.prepareHandle(handle, { kind: 'platform', index });
    });
    const start = this.add.rectangle(this.levelData.start.x, this.levelData.start.y, 38, 38, 0x28d7dd).setStrokeStyle(6, 0x061a27).setDepth(4);
    const finish = this.add.star(this.levelData.finish.x, this.levelData.finish.y, 4, 13, 25, 0xed674b).setStrokeStyle(5, 0xf5e4bd).setDepth(4);
    this.prepareHandle(start, { kind: 'start' });
    this.prepareHandle(finish, { kind: 'finish' });
    this.startLabel = this.add.text(0, 0, 'DÉPART', this.markerLabelStyle()).setDepth(4);
    this.finishLabel = this.add.text(0, 0, 'ARRIVÉE', this.markerLabelStyle()).setDepth(4);
    this.updateMarkerLabels();
  }

  private prepareHandle(handle: Phaser.GameObjects.Shape, selection: Exclude<EditorSelection, null>): void {
    handle.setData('selection', selection).setInteractive({ useHandCursor: true, draggable: true });
    handle.on('pointerdown', () => this.select(selection));
    this.input.setDraggable(handle);
    this.handles.push(handle);
  }

  private moveSelection(selection: Exclude<EditorSelection, null>, x: number, y: number): void {
    const selected = this.getSelected(selection);
    selected.y = Phaser.Math.Clamp(Math.round(y / 10) * 10, 180, 760);
    if (selection.kind === 'terrain') {
      const previous = this.levelData.terrain[selection.index - 1]?.x ?? -40;
      const next = this.levelData.terrain[selection.index + 1]?.x ?? this.levelData.width + 40;
      selected.x = Phaser.Math.Clamp(Math.round(x / 10) * 10, previous + 40, next - 40);
    } else {
      selected.x = Phaser.Math.Clamp(Math.round(x / 10) * 10, 0, this.levelData.width);
    }
  }

  private changeSelection(property: 'x' | 'y' | 'width' | 'angle', value: number): void {
    if (!this.selection) return;
    this.pushHistory();
    const selected = this.getSelected(this.selection);
    if (this.selection.kind === 'platform' && (property === 'width' || property === 'angle')) {
      const platform = this.levelData.platforms[this.selection.index];
      if (property === 'width') platform.width = Phaser.Math.Clamp(value, 80, 800);
      else platform.angle = Phaser.Math.Clamp(value, -0.8, 0.8);
    } else if (property === 'x' || property === 'y') {
      this.moveSelection(this.selection, property === 'x' ? value : selected.x, property === 'y' ? value : selected.y);
    }
    this.redrawTerrain();
    this.rebuildHandles();
    this.editor.refresh(this.levelData);
    this.refreshDirtyState();
  }

  private addPlatform(): void {
    this.pushHistory();
    const x = Phaser.Math.Clamp(this.cameras.main.scrollX + this.cameras.main.width / this.cameras.main.zoom / 2, 100, this.levelData.width - 100);
    this.levelData.platforms.push({ id: `platform-${crypto.randomUUID().slice(0, 8)}`, x: Math.round(x / 10) * 10, y: 390, width: 240, angle: 0 });
    this.selection = { kind: 'platform', index: this.levelData.platforms.length - 1 };
    this.redrawTerrain();
    this.rebuildHandles();
    this.editor.setSelection(this.selection, this.levelData);
    this.editor.setStatus('Plateforme ajoutée');
    this.refreshDirtyState();
  }

  private deleteSelection(): void {
    if (this.selection?.kind !== 'platform') return;
    this.pushHistory();
    this.levelData.platforms.splice(this.selection.index, 1);
    this.selection = null;
    this.redrawTerrain();
    this.rebuildHandles();
    this.editor.setSelection(null, this.levelData);
    this.editor.setStatus('Plateforme supprimée');
    this.refreshDirtyState();
  }

  private select(selection: Exclude<EditorSelection, null>): void {
    this.selection = selection;
    this.redrawTerrain();
    this.editor.setSelection(selection, this.levelData);
  }

  private getSelected(selection: Exclude<EditorSelection, null>) {
    if (selection.kind === 'terrain') return this.levelData.terrain[selection.index];
    if (selection.kind === 'platform') return this.levelData.platforms[selection.index];
    return this.levelData[selection.kind];
  }

  private pushHistory(): void {
    this.history.push(structuredClone(this.levelData));
    if (this.history.length > 30) this.history.shift();
    this.editor?.setUndoAvailable(true);
  }

  private undo(): void {
    const previous = this.history.pop();
    if (!previous) {
      this.editor.setStatus('Rien à annuler');
      return;
    }
    this.levelData = previous;
    this.selection = null;
    this.redrawTerrain();
    this.rebuildHandles();
    this.editor.setSelection(null, this.levelData);
    this.editor.setUndoAvailable(this.history.length > 0);
    this.refreshDirtyState();
  }

  private save(): void {
    saveActiveLevel(this.levelData);
    this.savedSnapshot = JSON.stringify(this.levelData);
    this.editor.setDirty(false);
  }

  private testLevel(): void {
    this.save();
    this.editor.hide();
    this.scene.start('GameScene');
  }

  private exitEditor(): void {
    if (this.isDirty() && !window.confirm('Quitter sans sauvegarder les modifications ?')) return;
    this.editor.hide();
    this.scene.start('GameScene');
  }

  private reset(): void {
    this.pushHistory();
    this.levelData = resetActiveLevel();
    this.selection = null;
    this.redrawTerrain();
    this.rebuildHandles();
    this.editor.setSelection(null, this.levelData);
    this.savedSnapshot = JSON.stringify(this.levelData);
    this.history = [];
    this.editor.setUndoAvailable(false);
    this.editor.setStatus('Niveau d’origine restauré', 'success');
  }

  private importLevel(level: LevelData): void {
    this.pushHistory();
    this.levelData = level;
    this.selection = null;
    this.cameras.main.setBounds(0, -100, level.width, 1050);
    this.redrawTerrain();
    this.rebuildHandles();
    this.editor.setSelection(null, this.levelData);
    this.refreshDirtyState();
  }

  private pan(direction: -1 | 1): void {
    this.cameras.main.scrollX += direction * this.cameras.main.width / this.cameras.main.zoom * 0.7;
    this.clampCamera();
  }

  private panTo(x: number): void {
    this.cameras.main.scrollX = x - this.cameras.main.width / this.cameras.main.zoom / 2;
    this.clampCamera();
  }

  private clampCamera(): void {
    const viewWidth = this.cameras.main.width / this.cameras.main.zoom;
    this.cameras.main.scrollX = Phaser.Math.Clamp(this.cameras.main.scrollX, 0, Math.max(0, this.levelData.width - viewWidth));
  }

  private setGameInterfaceVisible(visible: boolean): void {
    const hud = document.querySelector<HTMLElement>('#hud');
    const message = document.querySelector<HTMLElement>('#status-message');
    if (hud) hud.hidden = !visible;
    if (message) message.classList.remove('is-visible');
  }

  private updateMarkerLabels(): void {
    this.startLabel?.setPosition(this.levelData.start.x + 30, this.levelData.start.y - 14);
    this.finishLabel?.setPosition(this.levelData.finish.x + 32, this.levelData.finish.y - 14);
  }

  private markerLabelStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return { fontFamily: 'Bebas Neue', fontSize: '22px', color: '#f5e4bd', letterSpacing: 2 };
  }

  private isDirty(): boolean { return JSON.stringify(this.levelData) !== this.savedSnapshot; }

  private refreshDirtyState(): void { this.editor.setDirty(this.isDirty()); }
}
