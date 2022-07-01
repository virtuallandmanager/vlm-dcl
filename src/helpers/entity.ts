import { TEntity, TEntityInstance } from "../types/Entity";

export function getId(ref: TEntity | TEntityInstance) {
  return ref.customId || ref.id;
}

export const getEntityByName = (name: string) =>
  Object.keys(engine.entities)
    .map((key) => engine.entities[key])
    .filter((entity) => (entity as Entity).name === name)[0];
