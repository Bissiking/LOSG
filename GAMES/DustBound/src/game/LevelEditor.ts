// src/game/LevelEditor.ts
import type { LevelData } from '../levels/level01';
import { normalizeLevel } from './LevelStore';

export type EditorSelection =
  | { kind: 'terrain'; index: number }
  | { kind: 'platform'; index: number }
  | { kind: 'start' }
  | { kind: 'finish' }
  | null;

interface EditorCallbacks {
  onChange: (property: 'x' | 'y' | 'width' | 'angle', value: number) => void;
  onAddPlatform: () => void;
  onDelete: () => void;
  onUndo: () => void;
  onSave: () => void;
  onTest: () => void;
  onExit: () => void;
  onReset: () => void;
  onImport: (level: LevelData) => void;
  onPan: (direction: -1 | 1) => void;
  getLevel: () => LevelData;
}

export class LevelEditor {
  private readonly root: HTMLElement;
  private readonly callbacks: EditorCallbacks;
  private selection: EditorSelection = null;
  private readonly listeners: Array<() => void> = [];

  constructor(callbacks: EditorCallbacks) {
    this.callbacks = callbacks;
    this.root = this.requireElement('#editor-ui');
    this.bindButton('#editor-pan-left', () => callbacks.onPan(-1));
    this.bindButton('#editor-pan-right', () => callbacks.onPan(1));
    this.bindButton('#editor-undo', callbacks.onUndo);
    this.bindButton('#editor-add-platform', callbacks.onAddPlatform);
    this.bindButton('#editor-save', callbacks.onSave);
    this.bindButton('#editor-test', callbacks.onTest);
    this.bindButton('#editor-exit', callbacks.onExit);
    this.bindButton('#editor-delete', callbacks.onDelete);
    this.bindButton('#editor-reset', callbacks.onReset);
    this.bindButton('#editor-export', () => this.exportLevel());
    this.bindNumber('#editor-x', 'x');
    this.bindNumber('#editor-y', 'y');
    this.bindNumber('#editor-width', 'width');
    this.bindNumber('#editor-angle', 'angle');
    this.bindImport();
  }

  show(): void { this.root.hidden = false; }
  hide(): void { this.root.hidden = true; }

  destroy(): void {
    this.listeners.forEach((remove) => remove());
    this.listeners.length = 0;
    this.hide();
  }

  setStatus(message: string, state: 'normal' | 'success' | 'error' = 'normal'): void {
    const status = this.requireElement('#editor-status');
    status.textContent = message;
    status.dataset.state = state;
  }

  setDirty(dirty: boolean): void {
    this.setStatus(dirty ? 'Modifications non sauvegardées' : 'Niveau sauvegardé', dirty ? 'error' : 'success');
  }

  setUndoAvailable(available: boolean): void {
    this.requireElement<HTMLButtonElement>('#editor-undo').disabled = !available;
  }

  setSelection(selection: EditorSelection, level: LevelData): void {
    this.selection = selection;
    const fields = this.requireElement('#editor-fields');
    const deleteButton = this.requireElement<HTMLButtonElement>('#editor-delete');
    const widthField = this.requireElement('#editor-width-field');
    const angleField = this.requireElement('#editor-angle-field');
    if (!selection) {
      this.requireElement('#editor-selection-title').textContent = 'AUCUNE SÉLECTION';
      this.requireElement('#editor-selection-kind').textContent = 'Cliquez un élément';
      fields.hidden = true;
      deleteButton.hidden = true;
      return;
    }

    const selected = this.getSelectedValue(level, selection);
    const kindLabels = { terrain: 'POINT DE TERRAIN', platform: 'PLATEFORME', start: 'DÉPART', finish: 'ARRIVÉE' };
    this.requireElement('#editor-selection-title').textContent = kindLabels[selection.kind];
    this.requireElement('#editor-selection-kind').textContent = selection.kind === 'platform'
      ? level.platforms[selection.index].id
      : selection.kind === 'terrain' ? `Point ${selection.index + 1} / ${level.terrain.length}` : 'Repère de course';
    this.requireElement<HTMLInputElement>('#editor-x').value = Math.round(selected.x).toString();
    this.requireElement<HTMLInputElement>('#editor-y').value = Math.round(selected.y).toString();
    fields.hidden = false;

    const isPlatform = selection.kind === 'platform';
    widthField.hidden = !isPlatform;
    angleField.hidden = !isPlatform;
    deleteButton.hidden = !isPlatform;
    if (isPlatform) {
      const platform = level.platforms[selection.index];
      this.requireElement<HTMLInputElement>('#editor-width').value = Math.round(platform.width).toString();
      this.requireElement<HTMLInputElement>('#editor-angle').value = Math.round((platform.angle ?? 0) * 180 / Math.PI).toString();
    }
  }

  refresh(level: LevelData): void { this.setSelection(this.selection, level); }

  private bindButton(selector: string, callback: () => void): void {
    const button = this.requireElement<HTMLButtonElement>(selector);
    const listener = (): void => callback();
    button.addEventListener('click', listener);
    this.listeners.push(() => button.removeEventListener('click', listener));
  }

  private bindNumber(selector: string, property: 'x' | 'y' | 'width' | 'angle'): void {
    const input = this.requireElement<HTMLInputElement>(selector);
    const listener = (): void => {
      const value = Number(input.value);
      if (Number.isFinite(value)) this.callbacks.onChange(property, property === 'angle' ? value * Math.PI / 180 : value);
    };
    input.addEventListener('change', listener);
    this.listeners.push(() => input.removeEventListener('change', listener));
  }

  private bindImport(): void {
    const input = this.requireElement<HTMLInputElement>('#editor-import');
    const listener = async (): Promise<void> => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        this.callbacks.onImport(normalizeLevel(JSON.parse(await file.text())));
        this.setStatus('Niveau importé', 'success');
      } catch (error) {
        this.setStatus(error instanceof Error ? error.message : 'Import impossible', 'error');
      } finally {
        input.value = '';
      }
    };
    input.addEventListener('change', listener);
    this.listeners.push(() => input.removeEventListener('change', listener));
  }

  private exportLevel(): void {
    const blob = new Blob([JSON.stringify(this.callbacks.getLevel(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${this.callbacks.getLevel().id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    this.setStatus('JSON exporté', 'success');
  }

  private getSelectedValue(level: LevelData, selection: Exclude<EditorSelection, null>) {
    if (selection.kind === 'terrain') return level.terrain[selection.index];
    if (selection.kind === 'platform') return level.platforms[selection.index];
    return level[selection.kind];
  }

  private requireElement<T extends HTMLElement = HTMLElement>(selector: string): T {
    const element = document.querySelector<T>(selector);
    if (!element) throw new Error(`Élément éditeur manquant : ${selector}`);
    return element;
  }
}
