import { ParticleSystem } from "love.graphics";

import { HALF_TILE, Level, TILE_SIZE_PIXELS } from "./models";

export enum ZoneType {
  Hot,
  Dead,
}

let hotZoneEmitter: ParticleSystem;

export function initZoneEmitters(): void {
  const hotZoneParticle = love.graphics.newImage("res/zone-particle-high.png");
  hotZoneEmitter = love.graphics.newParticleSystem(hotZoneParticle);
  hotZoneEmitter.setParticleLifetime(2, 5);
  hotZoneEmitter.setEmissionRate(1);
  hotZoneEmitter.setSizeVariation(1);
  hotZoneEmitter.setLinearAcceleration(0, -4);
  hotZoneEmitter.setEmissionArea("normal", HALF_TILE, HALF_TILE);
  hotZoneEmitter.setColors(1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0);
}

export function newZoneEmitter(type: ZoneType, x: number, y: number): ParticleSystem {
  const emitter = type === ZoneType.Hot ? hotZoneEmitter.clone() : hotZoneEmitter.clone();
  emitter.setPosition(x + HALF_TILE, y + TILE_SIZE_PIXELS * 0.75);
  return emitter;
}

let emitters: ParticleSystem[] = [];
export function createParticleEmitters({ zoneModes }: Level): void {
  for (let y = 0; y < zoneModes.length; ++y) {
    for (let x = 0; x < zoneModes[y].length; ++x) {
      const tile = zoneModes[y][x];
      if (tile === "hot") {
        emitters.push(newZoneEmitter(ZoneType.Hot, x * TILE_SIZE_PIXELS, y * TILE_SIZE_PIXELS));
      }
    }
  }
}

export function clearParticleEmitters(): void {
  emitters = [];
}

export function updateParticleEmitters(): void {
  emitters.forEach((emitter) => emitter.update(1 / 60));
}

export function drawParticleEmitters(): void {
  love.graphics.setColor(1, 1, 1);
  emitters.forEach((emitter) => love.graphics.draw(emitter));
}
