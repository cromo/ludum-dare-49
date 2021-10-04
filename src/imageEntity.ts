import { Image } from "love.graphics";

import { ImageEntity, Point } from "./models";

// export function createTerminalEntity(pos: Point, terminalAnotation: TerminalAnnotation): TerminalEntity {
//   const terminalEntity: TerminalEntity = {

export function createImageEntity(pos: Point, image: Image): ImageEntity {
  return {
    type: "imageEntity",
    pos,
    image,
    draw: (l, e) => {
      const imageEntity = e as ImageEntity;
      love.graphics.draw(imageEntity.image, imageEntity.pos.x, imageEntity.pos.y);
    },
    update: (l, e) => {
      return e;
    },
  };
}
