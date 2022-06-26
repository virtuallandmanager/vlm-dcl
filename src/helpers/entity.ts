import { TImage } from "../types/TImage";

export function getId(ref: TImage) {
  return ref.customId || ref.id;
}

export const getEntityByName = (name: string) =>
  Object.keys(engine.entities)
    .map((key) => engine.entities[key])
    .filter((entity) => (entity as Entity).name === name)[0];
