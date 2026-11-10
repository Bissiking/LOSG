// src/game/Vehicle.ts
import Phaser from 'phaser';
import type { DriveInput } from './InputController';

export class Vehicle {
  readonly chassis: Phaser.Physics.Matter.Image;
  readonly rearWheel: Phaser.Physics.Matter.Image;
  readonly frontWheel: Phaser.Physics.Matter.Image;
  private readonly scene: Phaser.Scene;
  private readonly suspensionGraphics: Phaser.GameObjects.Graphics;
  private readonly rearConstraint: MatterJS.ConstraintType;
  private readonly frontConstraint: MatterJS.ConstraintType;
  private readonly rearGuideConstraint: MatterJS.ConstraintType;
  private readonly frontGuideConstraint: MatterJS.ConstraintType;
  private groundedUntil = 0;
  private invertedSince = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    const collisionGroup = scene.matter.world.nextGroup(true);

    this.chassis = scene.matter.add.image(x, y, 'buggy-chassis').setRectangle(146, 43, {
      friction: 0.55,
      frictionAir: 0.018,
      density: 0.0032,
      restitution: 0.08,
      chamfer: { radius: 12 },
      label: 'buggy-chassis',
      collisionFilter: { group: collisionGroup },
    }).setDepth(4);

    this.rearWheel = this.createWheel(x - 54, y + 50, collisionGroup, 'buggy-rear-wheel');
    this.frontWheel = this.createWheel(x + 56, y + 50, collisionGroup, 'buggy-front-wheel');

    this.rearConstraint = scene.matter.add.constraint(
      this.chassis.body as MatterJS.BodyType,
      this.rearWheel.body as MatterJS.BodyType,
      36,
      0.38,
      { pointA: { x: -54, y: 15 }, damping: 0.28, label: 'rear-suspension' },
    );
    this.frontConstraint = scene.matter.add.constraint(
      this.chassis.body as MatterJS.BodyType,
      this.frontWheel.body as MatterJS.BodyType,
      36,
      0.38,
      { pointA: { x: 54, y: 15 }, damping: 0.28, label: 'front-suspension' },
    );

    // Le second bras transforme chaque roue pendulaire en train triangulé.
    // La roue conserve une course verticale, mais ne peut plus s'écarter du châssis.
    this.rearGuideConstraint = scene.matter.add.constraint(
      this.chassis.body as MatterJS.BodyType,
      this.rearWheel.body as MatterJS.BodyType,
      43,
      0.2,
      { pointA: { x: -38, y: 9 }, damping: 0.32, label: 'rear-suspension-guide' },
    );
    this.frontGuideConstraint = scene.matter.add.constraint(
      this.chassis.body as MatterJS.BodyType,
      this.frontWheel.body as MatterJS.BodyType,
      43,
      0.2,
      { pointA: { x: 38, y: 9 }, damping: 0.32, label: 'front-suspension-guide' },
    );

    this.suspensionGraphics = scene.add.graphics().setDepth(3);
    this.listenForGroundContact();
  }

  update(input: DriveInput, enabled: boolean): void {
    const throttle = enabled ? input.throttle : 0;
    const tilt = enabled ? input.tilt : 0;
    const grounded = this.isGrounded();

    if (throttle !== 0) {
      const desiredSpin = throttle * 0.39;
      for (const wheel of [this.rearWheel, this.frontWheel]) {
        const current = (wheel.body as MatterJS.BodyType).angularVelocity;
        wheel.setAngularVelocity(Phaser.Math.Linear(current, desiredSpin, grounded ? 0.075 : 0.018));
      }
      const chassisBody = this.chassis.body as MatterJS.BodyType;
      if (grounded && Math.abs(chassisBody.velocity.x) < 21) {
        this.chassis.applyForce(new Phaser.Math.Vector2(throttle * 0.0048, 0.00018));
      }
    } else if (grounded) {
      const rearBody = this.rearWheel.body as MatterJS.BodyType;
      const frontBody = this.frontWheel.body as MatterJS.BodyType;
      this.rearWheel.setAngularVelocity(rearBody.angularVelocity * 0.965);
      this.frontWheel.setAngularVelocity(frontBody.angularVelocity * 0.965);
    }

    if (!grounded && tilt !== 0) {
      const chassisBody = this.chassis.body as MatterJS.BodyType;
      this.chassis.setAngularVelocity(Phaser.Math.Clamp(chassisBody.angularVelocity + tilt * 0.012, -0.16, 0.16));
    }

    const chassisBody = this.chassis.body as MatterJS.BodyType;
    if (grounded && chassisBody.velocity.y > 3) {
      this.chassis.applyForce(new Phaser.Math.Vector2(0, 0.0007));
    }
    this.drawSuspensions();
  }

  respawn(x: number, y: number): void {
    this.setBodyState(this.chassis, x, y, 0);
    this.setBodyState(this.rearWheel, x - 54, y + 50, 0);
    this.setBodyState(this.frontWheel, x + 56, y + 50, 0);
    this.groundedUntil = this.scene.time.now + 250;
    this.invertedSince = 0;
  }

  shouldRespawn(): boolean {
    if (this.chassis.y > 980 || this.chassis.x < -80) return true;
    const angle = Math.abs(Phaser.Math.Angle.Wrap(this.chassis.rotation));
    const nearlyStopped = Math.abs((this.chassis.body as MatterJS.BodyType).velocity.x) < 1.2;
    if (angle > 2.05 && nearlyStopped && this.isGrounded()) {
      if (this.invertedSince === 0) this.invertedSince = this.scene.time.now;
      return this.scene.time.now - this.invertedSince > 1300;
    }
    this.invertedSince = 0;
    return false;
  }

  get x(): number { return this.chassis.x; }
  get y(): number { return this.chassis.y; }

  get speedKmh(): number {
    const velocity = (this.chassis.body as MatterJS.BodyType).velocity;
    return Phaser.Math.Clamp(Math.hypot(velocity.x, velocity.y) * 6.4, 0, 160);
  }

  private createWheel(x: number, y: number, group: number, label: string): Phaser.Physics.Matter.Image {
    return this.scene.matter.add.image(x, y, 'buggy-wheel').setCircle(29, {
      friction: 1.05,
      frictionStatic: 1.4,
      frictionAir: 0.009,
      density: 0.0024,
      restitution: 0.12,
      label,
      collisionFilter: { group },
    }).setDepth(5);
  }

  private setBodyState(body: Phaser.Physics.Matter.Image, x: number, y: number, angle: number): void {
    body.setPosition(x, y).setVelocity(0, 0).setAngularVelocity(0).setAngle(Phaser.Math.RadToDeg(angle));
  }

  private isGrounded(): boolean { return this.scene.time.now < this.groundedUntil; }

  private listenForGroundContact(): void {
    this.scene.matter.world.on('collisionactive', (event: Phaser.Physics.Matter.Events.CollisionActiveEvent) => {
      for (const pair of event.pairs) {
        const labels = [pair.bodyA.label, pair.bodyB.label];
        const hasWheel = labels.includes('buggy-rear-wheel') || labels.includes('buggy-front-wheel');
        if (hasWheel && labels.includes('terrain')) this.groundedUntil = this.scene.time.now + 100;
      }
    });
  }

  private drawSuspensions(): void {
    this.suspensionGraphics.clear();
    this.drawSpring(this.rearConstraint, this.rearWheel.x, this.rearWheel.y);
    this.drawSpring(this.frontConstraint, this.frontWheel.x, this.frontWheel.y);
    this.drawGuideArm(this.rearGuideConstraint, this.rearWheel.x, this.rearWheel.y);
    this.drawGuideArm(this.frontGuideConstraint, this.frontWheel.x, this.frontWheel.y);
  }

  private drawSpring(constraint: MatterJS.ConstraintType, wheelX: number, wheelY: number): void {
    const anchor = this.getConstraintAnchor(constraint);
    const dx = wheelX - anchor.x;
    const dy = wheelY - anchor.y;
    const length = Math.hypot(dx, dy);
    const nx = -dy / length;
    const ny = dx / length;
    const segments = 8;
    const strokeSpring = (width: number, color: number): void => {
      this.suspensionGraphics.lineStyle(width, color, 1).beginPath().moveTo(anchor.x, anchor.y);
      for (let step = 1; step < segments; step += 1) {
        const t = step / segments;
        const offset = (step % 2 === 0 ? -1 : 1) * 5;
        this.suspensionGraphics.lineTo(anchor.x + dx * t + nx * offset, anchor.y + dy * t + ny * offset);
      }
      this.suspensionGraphics.lineTo(wheelX, wheelY).strokePath();
    };
    strokeSpring(7, 0x061a27);
    strokeSpring(3, 0xf5e4bd);
    this.suspensionGraphics.lineStyle(2, 0xed674b, 1).strokeLineShape(new Phaser.Geom.Line(anchor.x, anchor.y, wheelX, wheelY));
  }

  private drawGuideArm(constraint: MatterJS.ConstraintType, wheelX: number, wheelY: number): void {
    const anchor = this.getConstraintAnchor(constraint);
    this.suspensionGraphics.lineStyle(4, 0x061a27, 1).strokeLineShape(new Phaser.Geom.Line(anchor.x, anchor.y, wheelX, wheelY));
    this.suspensionGraphics.lineStyle(2, 0x28d7dd, 0.85).strokeLineShape(new Phaser.Geom.Line(anchor.x, anchor.y, wheelX, wheelY));
  }

  private getConstraintAnchor(constraint: MatterJS.ConstraintType): Phaser.Math.Vector2 {
    const pointA = constraint.pointA ?? { x: 0, y: 0 };
    const bodyA = constraint.bodyA;
    const angle = bodyA?.angle ?? 0;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Phaser.Math.Vector2(
      (bodyA?.position.x ?? 0) + pointA.x * cos - pointA.y * sin,
      (bodyA?.position.y ?? 0) + pointA.x * sin + pointA.y * cos,
    );
  }
}
