import { ParticleSystem } from "love.graphics";

import { HALF_TILE, Level, TILE_SIZE_PIXELS, ZONE_PARTICLES_PER_SECOND } from "./models";

export enum ZoneType {
  Hot,
  Dead,
}

let hotZoneEmitter: ParticleSystem;
let coldZoneEmitter: ParticleSystem;

export function initZoneEmitters(): void {
  const hotZoneParticle = love.graphics.newImage("res/zone-particle-high.png");
  hotZoneEmitter = love.graphics.newParticleSystem(hotZoneParticle);
  hotZoneEmitter.setParticleLifetime(2, 5);
  hotZoneEmitter.setEmissionRate(ZONE_PARTICLES_PER_SECOND);
  hotZoneEmitter.setSizeVariation(1);
  hotZoneEmitter.setLinearAcceleration(0, -4);
  hotZoneEmitter.setEmissionArea("normal", HALF_TILE, HALF_TILE);
  hotZoneEmitter.setColors(1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0);

  coldZoneEmitter = love.graphics.newParticleSystem(hotZoneParticle);
  coldZoneEmitter.setParticleLifetime(2, 5);
  coldZoneEmitter.setEmissionRate(ZONE_PARTICLES_PER_SECOND);
  coldZoneEmitter.setSizeVariation(1);
  coldZoneEmitter.setLinearAcceleration(0, 4);
  coldZoneEmitter.setEmissionArea("normal", HALF_TILE, HALF_TILE);
  coldZoneEmitter.setColors(0.1, 0.1, 0.1, 0, 0.1, 0.1, 0, 1, 0.1, 0.1, 0.1, 0);
}

export function newZoneEmitter(type: ZoneType, x: number, y: number): ParticleSystem {
  const emitter = type === ZoneType.Hot ? hotZoneEmitter.clone() : coldZoneEmitter.clone();
  emitter.setPosition(x + HALF_TILE, y + TILE_SIZE_PIXELS * (type === ZoneType.Hot ? 0.75 : 0.25));
  // Prime the emitter
  emitter.update(2);
  return emitter;
}

let emitters: ParticleSystem[] = [];
export function createParticleEmitters({ zoneModes }: Level): void {
  for (let y = 0; y < zoneModes.length; ++y) {
    for (let x = 0; x < zoneModes[y].length; ++x) {
      const tile = zoneModes[y][x];
      if (tile === "hot") {
        emitters.push(newZoneEmitter(ZoneType.Hot, x * TILE_SIZE_PIXELS, y * TILE_SIZE_PIXELS));
      } else if (tile === "dead") {
        emitters.push(newZoneEmitter(ZoneType.Dead, x * TILE_SIZE_PIXELS, y * TILE_SIZE_PIXELS));
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
