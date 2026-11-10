// src/game/MobileControls.ts
import type { InputController } from './InputController';

interface ControlDefinition {
  label: string;
  className: string;
  svg: string;
  onPress: () => void;
  onRelease: () => void;
}

export class MobileControls {
  private readonly root: HTMLElement;

  constructor(input: InputController) {
    const root = document.querySelector<HTMLElement>('#mobile-controls');
    if (!root) throw new Error('Mobile controls root missing');
    this.root = root;
    this.root.replaceChildren();

    const drive = this.createCluster('drive');
    const tilt = this.createCluster('tilt');
    drive.append(
      this.createButton({ label: 'Freiner ou reculer', className: 'drive-reverse', svg: '<path d="M15 18 9 12l6-6"/>', onPress: () => input.setMobileThrottle(-1), onRelease: () => input.setMobileThrottle(0) }),
      this.createButton({ label: 'Accélérer', className: 'drive-forward', svg: '<path d="m9 18 6-6-6-6"/>', onPress: () => input.setMobileThrottle(1), onRelease: () => input.setMobileThrottle(0) }),
    );
    tilt.append(
      this.createButton({ label: 'Incliner le nez vers le haut', className: 'tilt-control', svg: '<path d="M5 15h14M8 12l4-5 4 5"/>', onPress: () => input.setMobileTilt(-1), onRelease: () => input.setMobileTilt(0) }),
      this.createButton({ label: 'Incliner le nez vers le bas', className: 'tilt-control', svg: '<path d="M5 9h14m-11 3 4 5 4-5"/>', onPress: () => input.setMobileTilt(1), onRelease: () => input.setMobileTilt(0) }),
    );
    this.root.append(drive, tilt);
  }

  destroy(): void { this.root.replaceChildren(); }

  private createCluster(className: string): HTMLDivElement {
    const cluster = document.createElement('div');
    cluster.className = `control-cluster ${className}`;
    return cluster;
  }

  private createButton(definition: ControlDefinition): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `touch-control ${definition.className}`;
    button.setAttribute('aria-label', definition.label);
    button.innerHTML = `<svg aria-hidden="true" viewBox="0 0 24 24">${definition.svg}</svg>`;
    const press = (event: PointerEvent): void => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      button.dataset.active = 'true';
      definition.onPress();
    };
    const release = (event: PointerEvent): void => {
      event.preventDefault();
      button.dataset.active = 'false';
      definition.onRelease();
    };
    button.addEventListener('pointerdown', press);
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('lostpointercapture', () => {
      button.dataset.active = 'false';
      definition.onRelease();
    });
    return button;
  }
}
